import React from 'react'

import './index.scss'

interface IProps {
	// 框图坐标参数
	rect: ElectronShortcutCapture.IRect
	// 框图Canvas
	rectangle: HTMLCanvasElement
	// 屏幕截图资源
	source: ElectronShortcutCapture.ISource
	bounds: ElectronShortcutCapture.IBounds
	setBackgroundCtx: (ctx: CanvasRenderingContext2D) => void
	setBgHasDraw: (boo: boolean) => void
}

const Background: React.FC<IProps> = ({
	rect,
	rectangle,
	source,
	bounds,
	setBackgroundCtx,
	setBgHasDraw
}) => {
	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const [screenImg, setScreenImg] = React.useState<HTMLImageElement>(null)

	/**
	 * 一旦接收到屏幕截图就开始画canvas
	 */
	React.useEffect(() => {
		if (!!source && !!source.toPngSource) {
			setBgHasDraw(true)
			drawBackground()
		} else if (!!source && !source.toPngSource) {
			clearBackground()
		}
	}, [source])

	/**
	 * 监听框图坐标参数，参数改变重新画图
	 */
	React.useEffect(() => {
		// 画框中的图
		const { x1, y1, x2, y2 } = rect
		const { width, height } = bounds
		if (!!rectangle && !!screenImg) {
			try {
				const rectangleCx = rectangle.getContext('2d')
				// electron可用区域大小跟图片实际大小比率
				const xR = width / screenImg.width
				const yR = height / screenImg.height
				rectangle.width = (x2 - x1) / xR
				rectangle.height = (y2 - y1) / yR
				rectangleCx.drawImage(
					canvasRef.current,
					x1,
					y1,
					width,
					height,
					0,
					0,
					width,
					height
				)
				rectangle.style.width = '100%'
			} catch {}
		}
	}, [rect])

	// 画背景
	const drawBackground = () => {
		const currCtx = canvasRef.current.getContext('2d')
		const { actuallyWidth, actuallyHeight, toPngSource } = source
		const $img = new Image()
		const blob = new Blob([toPngSource], { type: 'image/png' })
		$img.src = URL.createObjectURL(blob)
		$img.addEventListener('load', () => {
			currCtx.drawImage($img, 0, 0, actuallyWidth, actuallyHeight)
			canvasRef.current.style.width = '100%'
			setScreenImg($img)
			setBackgroundCtx(canvasRef.current.getContext('2d'))
		})
	}
	// 清空背景
	const clearBackground = () => {
		const currCtx = canvasRef.current.getContext('2d')
		const { actuallyWidth, actuallyHeight } = source
		currCtx.clearRect(0, 0, actuallyWidth, actuallyHeight)
	}

	return (
		<canvas
			id="bg-container"
			ref={canvasRef}
			width={bounds.width}
			height={bounds.height}
		></canvas>
	)
}

export default Background
