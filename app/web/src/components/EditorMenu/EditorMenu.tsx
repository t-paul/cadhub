import { Menu } from '@headlessui/react'

import { useIdeContext, ideTypeNameMap } from 'src/helpers/hooks/useIdeContext'
import Svg from 'src/components/Svg/Svg'
import { useRender } from 'src/components/IdeWrapper/useRender'
import { makeStlDownloadHandler, PullTitleFromFirstLine } from './helpers'

const EditorMenu = () => {
  const handleRender = useRender()
  const { state, thunkDispatch } = useIdeContext()
  const handleStlDownload = makeStlDownloadHandler({
    type: state.objectData?.type,
    geometry: state.objectData?.data,
    fileName: PullTitleFromFirstLine(state.code || ''),
    thunkDispatch,
  })
  const cadName = ideTypeNameMap[state.ideType] || ''
  const isOpenScad = state.ideType === 'openScad'
  const isCadQuery = state.ideType === 'cadQuery'
  return (
    <div className="flex justify-between bg-ch-gray-760 text-gray-100">
      <div className="flex items-center h-9 w-full cursor-grab">
        <div className=" text-ch-gray-760 bg-ch-gray-300 cursor-grab px-2 h-full flex items-center">
          <Svg name="drag-grid" className="w-4 p-px" />
        </div>
        <div className="flex gap-6 px-5">
          <FileDropdown
            handleRender={handleRender}
            handleStlDownload={handleStlDownload}
          />
          <button className="cursor-not-allowed" disabled>
            Edit
          </button>
          <ViewDropdown
            handleLayoutReset={() => thunkDispatch({ type: 'resetLayout' })}
          />
        </div>
        <button
          className="text-ch-gray-300  h-full cursor-not-allowed"
          aria-label="editor settings"
          disabled
        >
          <Svg name="gear" className="w-6 p-px" />
        </button>
      </div>
      <div className="flex items-center cursor-default">
        <div
          className={`${isOpenScad && 'bg-yellow-200'} ${
            isCadQuery && 'bg-blue-800'
          } w-5 h-5 rounded-full`}
        />
        <div className="px-2">{cadName}</div>
      </div>
    </div>
  )
}

export default EditorMenu

function FileDropdown({ handleRender, handleStlDownload }) {
  return (
    <Dropdown name="File">
      <Menu.Item>
        {({ active }) => (
          <button
            className={`${active && 'bg-gray-600'} px-2 py-1`}
            onClick={handleRender}
          >
            Save &amp; Render{' '}
            <span className="text-gray-400 pl-4">
              {/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? (
                <>
                  <Svg
                    name="mac-cmd-key"
                    className="h-3 w-3 inline-block text-left"
                  />
                  S
                </>
              ) : (
                'Ctrl S'
              )}
            </span>
          </button>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }) => (
          <button
            className={`${active && 'bg-gray-600'} px-2 py-1 text-left`}
            onClick={handleStlDownload}
          >
            Download STL
          </button>
        )}
      </Menu.Item>
    </Dropdown>
  )
}

function ViewDropdown({ handleLayoutReset }) {
  return (
    <Dropdown name="View">
      <Menu.Item>
        {({ active }) => (
          <button
            className={`${active && 'bg-gray-600'} px-2 py-1`}
            onClick={handleLayoutReset}
          >
            Reset layout
          </button>
        )}
      </Menu.Item>
    </Dropdown>
  )
}

function Dropdown({
  name,
  children,
}: {
  name: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <Menu>
        <Menu.Button className="text-gray-100">{name}</Menu.Button>
        <Menu.Items className="absolute flex flex-col mt-4 bg-ch-gray-760 rounded text-gray-100 overflow-hidden whitespace-nowrap border border-ch-gray-700">
          {children}
        </Menu.Items>
      </Menu>
    </div>
  )
}
