import { cx } from 'emotion'
import { getRegisteredStyles, insertStyles } from '@emotion/utils'
import createCache from '@emotion/cache'
import { serializeStyles } from '@emotion/serialize'

const cache = createCache()

const IS_BROWSER = typeof window !== 'undefined'

const ILLEGAL_ESCAPE_SEQUENCE_ERROR =
  process.env.NODE_ENV === 'production'
    ? ''
    : `You have illegal escape sequence in your template literal, most likely inside content's property value.
Because you write your CSS inside a JavaScript string you actually have to do double escaping, so for example "content: '\\00d7';" should become "content: '\\\\00d7';".
You can read more about this here:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences`

const createStyled = (tag, options) => {
  if (process.env.NODE_ENV !== 'production') {
    if (tag === undefined) {
      throw new Error(
        'You are trying to create a styled element with an undefined component.\nYou may have forgotten to import it.'
      )
    }
  }
  let identifierName
  let targetClassName
  if (options !== undefined) {
    identifierName = options.label
    targetClassName = options.target
  }
  const isReal = tag.__emotion_real === tag
  const baseTag = (isReal && tag.__emotion_base) || tag

  return function() {
    let args = arguments
    let styles =
      isReal && tag.__emotion_styles !== undefined
        ? tag.__emotion_styles.slice(0)
        : []

    if (identifierName !== undefined) {
      styles.push(`label:${identifierName};`)
    }
    if (args[0] == null || args[0].raw === undefined) {
      styles.push.apply(styles, args)
    } else {
      if (process.env.NODE_ENV !== 'production' && args[0][0] === undefined) {
        console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR)
      }
      styles.push(args[0][0])
      let len = args.length
      let i = 1
      for (; i < len; i++) {
        if (process.env.NODE_ENV !== 'production' && args[0][i] === undefined) {
          console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR)
        }
        styles.push(args[i], args[0][i])
      }
    }

    const Styled = {
      functional: true,

      render(h, { data, children, parent, props }) {
        const { as, ...restAttrs } = data.attrs || {}

        let className = data.staticClass ? `${data.staticClass} ` : ''
        const finalTag = as || baseTag
        const classInterpolations = []
        const mergedProps = { ...props, ...parent.$evergarden }

        if (data.class) {
          className += getRegisteredStyles(
            cache.registered,
            classInterpolations,
            cx(data.class)
          )
        }

        const serialized = serializeStyles(
          styles.concat(classInterpolations),
          cache.registered,
          mergedProps
        )

        const rules = insertStyles(
          cache,
          serialized,
          typeof finalTag === 'string'
        )

        className += `${cache.key}-${serialized.name}`
        if (targetClassName !== undefined) {
          className += ` ${targetClassName}`
        }

        const elem = h(
          finalTag,
          {
            ...data,
            attrs: options.getAttrs ? options.getAttrs(restAttrs) : restAttrs,
            staticClass: undefined,
            class: className
          },
          children
        )

        if (!IS_BROWSER && rules !== undefined) {
          let serializedNames = serialized.name
          let next = serialized.next
          while (next !== undefined) {
            serializedNames += ' ' + next.name
            next = next.next
          }
          return [
            h('style', {
              domProps: {
                [`data-emotion-${cache.key}`]: serializedNames,
                innerHTML: rules,
                nonce: cache.sheet.nonce
              }
            }),
            elem
          ]
        }

        return elem
      }
    }

    Styled.name =
      identifierName !== undefined
        ? identifierName
        : `Styled${
            typeof baseTag === 'string' ? baseTag : baseTag.name || 'Component'
          }`

    Styled.props = tag.props
    Styled.__emotion_real = Styled
    Styled.__emotion_base = baseTag
    Styled.__emotion_styles = styles

    Object.defineProperty(Styled, 'toString', {
      value() {
        if (
          targetClassName === undefined &&
          process.env.NODE_ENV !== 'production'
        ) {
          return 'NO_COMPONENT_SELECTOR'
        }
        // $FlowFixMe
        return `.${targetClassName}`
      }
    })

    Styled.withComponent = (nextTag, nextOptions) => {
      return createStyled(
        nextTag,
        nextOptions !== undefined
          ? { ...(options || {}), ...nextOptions }
          : options
      )(...styles)
    }
    return Styled
  }
}

export const styled = createStyled
