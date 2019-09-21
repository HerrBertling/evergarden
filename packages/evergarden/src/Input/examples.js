import { Box, Input } from 'evergarden'

export default demoboard => {
  demoboard.section('Input').add('variants', {
    component: {
      render(h) {
        return <Box>
          <Input placeholder="Basic usage" />
          <Input variant="flushed" placeholder="Basic usage" />
          <Input variant="filled" placeholder="Basic usage" />
        </Box>
      }
    }
  })
}