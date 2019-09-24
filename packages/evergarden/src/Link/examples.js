import { Link, Stack } from 'evergarden'

export default { title: 'Link' }

export const basic = () => ({
  render(h) {
    return (
      <Stack>
        <Link >Ever Link</Link>
        <Link href="https://evergarden-ui.com">Ever Link to evergarden UI</Link>
        <Link isDisabled>disabled Ever Link</Link>
        <Link isExternal>external Ever Link. Would open in new tab</Link>
      </Stack>
    )
  }
})