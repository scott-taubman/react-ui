import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import Router from 'react-router-dom'
import { TCommand, TSystem } from 'test/test-values'
import { ConfigProviders } from 'test/testMocks'
import { Command, System } from 'types/backend-types'

import {
  CommandFormatter,
  useCommandsParameterized,
} from './useCommandsParameterized'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}))

describe('useCommandsParameterized', () => {
  afterAll(() => {
    jest.unmock('react-router-dom')
    jest.clearAllMocks()
  })

  test('returns commands', async () => {
    const formatter: CommandFormatter<Command> = (systems: System[]) => {
      return systems[0].commands
    }

    jest.spyOn(Router, 'useParams').mockReturnValue({
      systemName: TSystem.name,
      namespace: TSystem.namespace,
      version: TSystem.version,
    })

    const { result } = renderHook(() => useCommandsParameterized(formatter), {
      wrapper: ConfigProviders,
    })

    await waitFor(() => {
      expect(result.current.commands[0].name).toEqual(TCommand.name)
    })
  })
})
