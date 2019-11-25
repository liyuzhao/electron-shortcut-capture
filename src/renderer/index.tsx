import ReactDom from 'react-dom'
import React from 'react'

import ScreenShot from './screenShortcut'
import { listenClose } from './screenShortcut/events'
import './index.scss'

listenClose()

const render = () => {
	ReactDom.render(<ScreenShot />, document.querySelector('#app'))
}
render()
