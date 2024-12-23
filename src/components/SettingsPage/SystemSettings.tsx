import { FormSection } from '../Shared/Form/Section'
import { Group, TextInput } from '@mantine/core'
import { textInputStyles } from '../Shared/Styles'

const SystemSettings = () => {
  return (
      <FormSection title="System settings" className="mt-2 sm:mt-5">
        <Group grow wrap="wrap">
          <TextInput
            label="Exchange rate"
            placeholder="1.3"
            classNames={textInputStyles}
            disabled
          />
          <TextInput
            label="Freight"
            placeholder="4%"
            classNames={textInputStyles}
            disabled
          />
        </Group>
      </FormSection>
  )
}

export default SystemSettings