import { TextField } from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'
import { ColumnInstance, FilterProps } from 'react-table'
import { ObjectWithStringKeys } from 'types/custom-types'

const findFirstColumn = (
  columns: Array<ColumnInstance<ObjectWithStringKeys>>,
): ColumnInstance<ObjectWithStringKeys> =>
  columns[0].columns ? findFirstColumn(columns[0].columns) : columns[0]

const DefaultColumnFilter = ({
  columns,
  column,
}: FilterProps<ObjectWithStringKeys>) => {
  const { id, filterValue, setFilter, render } = column
  const [value, setValue] = useState(filterValue || '')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }

  useEffect(() => {
    setValue(filterValue || '')
  }, [filterValue])

  const isFirstColumn = findFirstColumn(columns) === column

  return (
    <TextField
      name={id}
      label={render('Header')}
      InputLabelProps={{ htmlFor: id }}
      value={value}
      autoFocus={isFirstColumn}
      variant="standard"
      onChange={handleChange}
      onBlur={(event) => setFilter(event.target.value || undefined)}
    />
  )
}

export { DefaultColumnFilter }
