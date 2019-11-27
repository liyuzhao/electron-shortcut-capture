import React from 'react'

import IconComplete from '../assets/svg/sure.svg'
import IconCancel from '../assets/svg/cancel.svg'
import IconDownload from '../assets/svg/download.svg'
import IconPen from '../assets/svg/pen.svg'
import IconCircle from '../assets/svg/circle.svg'
import { close, download, clipboard } from '../events'
import { makecurve, circle } from './tools'
import Setting from './setting'
import './index.scss'

interface IProps {
	canvasRef: HTMLCanvasElement
	style: React.CSSProperties
	rect: ElectronShortcutCapture.IRect
	controlToolbar: () => void
}

const ToolBar: React.FC<IProps> = ({
	canvasRef,
	style,
	controlToolbar,
	rect
}) => {
	const [currToolId, setCurrToolId] = React.useState('')
	const [pen, setPen] = React.useState<{
		update: (args: { color?: string; lineWidth?: number }) => void
	}>(null)
	const [drawCircle, setDrawCircle] = React.useState<{
		update: (args: { color?: string; lineWidth?: number }) => void
	}>(null)

	const onHandleToolbar = () => {
		controlToolbar()
	}

	const onHandleClick = (args: ElectronShortcutCapture.ISettingProps) => {
		switch (currToolId) {
			case '#pen':
				pen.update({
					lineWidth: args.thicknessNum,
					color: args.color
				})
				break
			case '#circle':
				drawCircle.update({
					lineWidth: args.thicknessNum,
					color: args.color
				})
				break
		}
	}

	const tools = [
		{
			icon: <IconComplete width={18} height={18} color="#4a6a39" />,
			click: () => {
				clipboard(canvasRef)
			}
		},
		{
			icon: <IconCancel width={18} height={18} color="#a13940" />,
			click: () => {
				close()
			}
		},
		{
			icon: <IconDownload width={18} height={18} color="#c5b3a5" />,
			click: () => {
				download(canvasRef)
			}
		},
		{
			icon: (
				<div className="tool">
					<IconPen width={18} height={18} color="#c5b3a5" id="pen" />
				</div>
			),
			click: () => {
				if (currToolId === '#pen') {
					return
				}
				setCurrToolId('#pen')
				onHandleToolbar()
				setPen(makecurve(rect, canvasRef))
			}
		},
		{
			icon: (
				<div className="tool">
					<IconCircle
						width={18}
						height={18}
						color="#c5b3a5"
						id="circle"
					/>
				</div>
			),
			click: () => {
				if (currToolId === '#circle') {
					return
				}
				setCurrToolId('#circle')
				onHandleToolbar()
				setDrawCircle(circle(rect, canvasRef))
			}
		}
	]

	return (
		<div className="toolbar" style={style}>
			{tools.map((v, idx) => {
				return (
					<div className="item" key={idx} onClick={v.click}>
						{v.icon}
					</div>
				)
			})}
			<Setting toolId={currToolId} onHandleClick={onHandleClick} />
		</div>
	)
}

export default ToolBar
