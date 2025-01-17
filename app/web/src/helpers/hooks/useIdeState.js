import { useReducer } from 'react'
import { cadPackages } from 'src/helpers/cadPackages'

function withThunk(dispatch, getState) {
  return (actionOrThunk) =>
    typeof actionOrThunk === 'function'
      ? actionOrThunk(dispatch, getState)
      : dispatch(actionOrThunk)
}

const initCodeMap = {
  openScad: `// involute donut

// ^ first comment is used for download title (i.e "involute-donut.stl")

// Follow the OpenSCAD tutorial: https://learn.cadhub.xyz/docs/

radius=3;
color(c="DarkGoldenrod")rotate_extrude()translate([20,0])circle(d=30);
color(c="hotpink")rotate_extrude()translate([20,0])offset(radius)offset(-radius)difference(){
    circle(d=34);
    translate([-200,-500])square([500,500]);
}`,
  cadQuery: `# demo shaft coupler

# ^ first comment is used for download title (i.e. "demo-shaft-coupler.stl")

# CadQuery docs: https://cadquery.readthedocs.io/

import cadquery as cq
from cadquery import exporters

diam = 5.0

result = (cq.Workplane().circle(diam).extrude(20.0)
          .faces(">Z").workplane(invert=True).circle(1.05).cutBlind(8.0)
          .faces("<Z").workplane(invert=True).circle(0.8).cutBlind(12.0)
          .edges("%CIRCLE").chamfer(0.15))

show_object(result)
`,
}

const codeStorageKey = 'Last-editor-code'
export const makeCodeStoreKey = (ideType) => `${codeStorageKey}-${ideType}`
let mutableState = null

export const useIdeState = () => {
  const code = ''
  const initialLayout = {
    direction: 'row',
    first: 'Editor',
    second: {
      direction: 'column',
      first: 'Viewer',
      second: 'Console',
      splitPercentage: 70,
    },
  }
  const initialState = {
    ideType: 'INIT',
    consoleMessages: [
      { type: 'message', message: 'Initialising', time: new Date() },
    ],
    code,
    objectData: {
      type: 'INIT',
      data: null,
    },
    layout: initialLayout,
    camera: {},
    viewerSize: { width: 0, height: 0 },
    isLoading: false,
  }
  const reducer = (state, { type, payload }) => {
    switch (type) {
      case 'initIde':
        return {
          ...state,
          code:
            localStorage.getItem(makeCodeStoreKey(payload.cadPackage)) ||
            initCodeMap[payload.cadPackage] ||
            '',
          ideType: payload.cadPackage,
        }
      case 'updateCode':
        return { ...state, code: payload }
      case 'healthyRender':
        return {
          ...state,
          objectData: {
            type: payload.objectData?.type,
            data: payload.objectData?.data,
          },
          consoleMessages: payload.message
            ? [...state.consoleMessages, payload.message]
            : payload.message,
          isLoading: false,
        }
      case 'errorRender':
        return {
          ...state,
          consoleMessages: payload.message
            ? [...state.consoleMessages, payload.message]
            : payload.message,
          isLoading: false,
        }
      case 'setLayout':
        return {
          ...state,
          layout: payload.message,
        }
      case 'updateCamera':
        return {
          ...state,
          camera: payload.camera,
        }
      case 'updateViewerSize':
        return {
          ...state,
          viewerSize: payload.viewerSize,
        }
      case 'setLoading':
        return {
          ...state,
          isLoading: true,
        }
      case 'resetLoading':
        return {
          ...state,
          isLoading: false,
        }
      case 'resetLayout':
        return {
          ...state,
          layout: initialLayout,
        }
      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState)
  mutableState = state
  const getState = () => mutableState
  return [state, withThunk(dispatch, getState)]
}

export const requestRender = ({
  state,
  dispatch,
  code,
  camera,
  viewerSize,
  specialCadProcess = null,
}) => {
  if (
    state.ideType !== 'INIT' &&
    (!state.isLoading || state.objectData?.type === 'INIT')
  ) {
    const renderFn = specialCadProcess
      ? cadPackages[state.ideType][specialCadProcess]
      : cadPackages[state.ideType].render
    return renderFn({
      code,
      settings: {
        camera,
        viewerSize,
      },
    })
      .then(({ objectData, message, status }) => {
        if (status === 'error') {
          dispatch({
            type: 'errorRender',
            payload: { message },
          })
        } else {
          dispatch({
            type: 'healthyRender',
            payload: { objectData, message, lastRunCode: code },
          })
          return objectData
        }
      })
      .catch(() => dispatch({ type: 'resetLoading' })) // TODO should probably display something to the user here
  }
}
