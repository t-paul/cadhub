import {
  lambdaBaseURL,
  stlToGeometry,
  createHealthyResponse,
  createUnhealthyResponse,
  timeoutErrorMessage,
} from './common'

export const render = async ({ code }) => {
  const body = JSON.stringify({
    settings: {
      deflection: 0.2
    },
    file: code,
  })
  try {
    const response = await fetch(lambdaBaseURL + '/cadquery/stl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })
    if (response.status === 400) {
      const { error } = await response.json()
      return {
        status: 'error',
        message: {
          type: 'error',
          message: error,
          time: new Date(),
        },
      }
    }
    if (response.status === 502) {
      return createUnhealthyResponse(new Date(), timeoutErrorMessage)
    }
    const data = await response.json()
    const geometry = await stlToGeometry(data.url)
    return createHealthyResponse({
      type: 'geometry',
      data: geometry,
      consoleMessage: data.consoleMessage,
      date: new Date(),
    })
  } catch (e) {
    return createUnhealthyResponse(new Date())
  }
}

const openScad = {
  render,
  // more functions to come
}

export default openScad
