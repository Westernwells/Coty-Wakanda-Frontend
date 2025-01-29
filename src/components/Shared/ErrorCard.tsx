import { Title } from '@mantine/core'

const ErrorCard = ({errorText="an error occured fetching data"}: {errorText?: string}) => {
  return (
        <Title
            order={1}
            className="text-red-600 capitalize mt-10 text-center font-semibold text-2xl sm:text-4xl"
        >
            {errorText}
        </Title>
  )
}

export default ErrorCard