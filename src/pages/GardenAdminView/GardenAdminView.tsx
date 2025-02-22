import { Alert, Backdrop, CircularProgress, Typography } from '@mui/material'
import { Divider } from 'components/Divider'
import { ErrorAlert } from 'components/ErrorAlert'
import { GardenConnectionForm } from 'components/GardenConnectionForm'
import { GardenSyncButton } from 'components/GardenSyncButton'
import { PageHeader } from 'components/PageHeader'
import { Snackbar } from 'components/Snackbar'
import { Table } from 'components/Table'
import { PermissionsContainer } from 'containers/PermissionsContainer'
import { SocketContainer } from 'containers/SocketContainer'
import useGardens from 'hooks/useGardens'
import { GardenAdminInfoCard } from 'pages/GardenAdminView'
import { systemMapper, useSystemIndexTableColumns } from 'pages/SystemIndex'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Garden } from 'types/backend-types'
import { SnackbarState } from 'types/custom-types'

const GardenAdminView = () => {
  const { addCallback, removeCallback } = SocketContainer.useContainer()
  const { hasPermission } = PermissionsContainer.useContainer()
  const systemsColumns = useSystemIndexTableColumns()
  const { error, getGarden } = useGardens()

  const [requestStatus, setRequestStatus] = useState<SnackbarState | undefined>(
    undefined,
  )
  const [garden, setGarden] = useState<Garden>()
  const params = useParams()

  const gardenName = String(params.gardenName)

  const fetchGarden = () =>
    getGarden(gardenName)
      .then((response) => setGarden(response.data))
      .catch((error) => {
        setRequestStatus({
          severity: 'error',
          message: error.response?.data.message || 'Problem fetching gardens',
          doNotAutoDismiss: true,
        })
      })

  useEffect(() => {
    fetchGarden()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    addCallback('garden_updates', (event) => {
      if (
        event.name === 'GARDEN_UPDATED' &&
        event.payload.name === gardenName
      ) {
        fetchGarden()
      }
    })
    return () => {
      removeCallback('garden_updates')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addCallback, removeCallback, gardenName, getGarden])

  const { updateGarden } = useGardens()

  const formOnSubmit = (garden: Garden) => {
    updateGarden(garden)
      .then(() =>
        setRequestStatus({
          severity: 'success',
          message: 'Connection update successful',
          showSeverity: false,
        }),
      )
      .catch((error) => {
        console.error('ERROR', error)

        if (error.response && error.response.statusText) {
          setRequestStatus({
            severity: 'error',
            message: `${error.response.status} ${error.response.statusText}`,
            doNotAutoDismiss: true,
          })
        } else {
          setRequestStatus({
            severity: 'error',
            message: `${error}`,
            doNotAutoDismiss: true,
          })
        }
      })
  }

  return !error ? (
    <>
      {hasPermission('garden:update') && (
        <Typography style={{ flex: 1, float: 'right' }}>
          <GardenSyncButton
            gardenName={gardenName}
            setSyncStatus={setRequestStatus}
          />
        </Typography>
      )}
      <PageHeader title="Garden View" description="" />
      <Divider />
      {garden ? (
        <>
          <GardenAdminInfoCard garden={garden} />
          <Divider />
          <Typography variant="h6">Connected Systems</Typography>
          {garden.status === 'RUNNING' ? (
            <Table
              tableKey={`${gardenName}systems`}
              data={garden.systems.map(systemMapper)}
              columns={systemsColumns}
            />
          ) : (
            `Unable to display systems when status is ${garden.status}`
          )}
          <Divider />
          {garden.connection_type === 'LOCAL' ? (
            <Alert severity="info">
              {
                'Since this is the local Garden it is not possible to modify connection information'
              }
            </Alert>
          ) : (
            garden.connection_params && (
              <GardenConnectionForm
                garden={garden}
                title="Update Connection Information"
                formOnSubmit={formOnSubmit}
              />
            )
          )}
        </>
      ) : (
        <Backdrop open={true}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      {requestStatus ? <Snackbar status={requestStatus} /> : null}
    </>
  ) : error.response ? (
    <ErrorAlert
      specific="garden"
      statusCode={error.response.status}
      errorMsg={error.response.statusText}
    />
  ) : (
    <Backdrop open={true}>
      <CircularProgress color="inherit" />
    </Backdrop>
  )
}

export { GardenAdminView }
