import {
	BrowserWindow,
	screen,
	ipcMain,
	dialog,
	clipboard,
	nativeImage,
	globalShortcut
} from 'electron'
import { EventEmitter } from 'events'

import browserWindowProps from './browserWindowProps'
import { events } from '../constant'

interface IBrowserWindow extends BrowserWindow {
	displayId: number
}

export default class electronShortcutCapture {
	constructor(props?: ElectronShortcutCapture.IElectronShortcutCaptureProps) {
		this.multiScreen = !!props ? !!props.multiScreen : false
		this.downloadFileprefix = !!props ? props.downloadFileprefix || '' : ''
		this.onClipboard = !!props ? props.onClipboard : null
		this.key = !!props ? props.key : ''
		this.onHide = !!props ? props.onHide : null
		this.initWin()
		this.bindHide()
		this.bindClipboard()
		this.bindDownload()
		this.listenCapturingDisplayId()
		this.bindKey()
		this.listenDisplayNumChange()
	}

	// 显示器数组
	private captureWins: IBrowserWindow[] = []
	// 当前需要操作显示器数组
	private handleCaptureWins: IBrowserWindow[] = []
	// 允许多屏幕
	private multiScreen: boolean = false
	// 快捷键
	private key: string = ''
	// 屏幕信息
	private displays: Electron.Display[] = []
	// 正在截图
	private shortcuting: boolean = false
	private downloadFileprefix: string = ''
	private onClipboard: (data: Electron.NativeImage) => void = null
	private onHide: () => void = null
	// 屏幕大小以及获取屏幕资源的宽高
	private screenInfo: any = {}

	private isWin7 =
		require('os')
			.release()
			.slice(0, 3) === '6.1'

	static URL =
		process.env.NODE_ENV === 'development'
			? 'http://localhost:8888'
			: `file://${require('path').join(
					__dirname,
					'../renderer/index.html'
			  )}`

	/**
	 * 获取当前鼠标所在的屏幕
	 */
	private getCurrentFocusDisplay = () => {
		const mousePoint = screen.getCursorScreenPoint()
		const display = screen.getDisplayNearestPoint(mousePoint)
		return display
	}

	/**
	 * 设置屏幕大小以及获取屏幕资源的宽高
	 */
	setScreenInfo = (display: Electron.Display) => {
		this.screenInfo[display.id] = {
			width: display.size.width,
			height: display.size.height
		}
		this.screenInfo['cutWidth'] =
			!!this.screenInfo['cutWidth'] &&
			this.screenInfo['cutWidth'] > display.size.width
				? this.screenInfo['cutWidth']
				: display.size.width
		this.screenInfo['cutHeight'] =
			!!this.screenInfo['cutHeight'] &&
			this.screenInfo['cutHeight'] > display.size.height
				? this.screenInfo['cutHeight']
				: display.size.height
	}

	/**
	 * 初始化窗口,打开预备窗口供使用，不用每次重新创建
	 */
	private initWin() {
		if (this.isWin7) {
			// win7拿到的source的display_id为空，这里不允许开启多屏幕
			this.multiScreen = false
		}
		// 获取设备所有显示器
		this.displays = screen.getAllDisplays()
		this.captureWins = this.displays.map(display => {
			this.setScreenInfo(display)
			const captureWin = new BrowserWindow(browserWindowProps(display))
			captureWin['displayId'] = display.id
			return captureWin
		}) as IBrowserWindow[]
		this.captureWins.forEach(v => {
			v.loadURL(electronShortcutCapture.URL)
		})
	}

	/**
	 * 打开截图
	 */
	async show() {
		if (this.shortcuting) {
			return console.log('正在截图')
		}
		this.shortcuting = true
		this.handleCaptureWins = this.captureWins
		/**
		 * 获取显示器信息
		 * 用不同显示器的最大宽高去获取资源，减少获取资源的次数
		 */
		const cutWidth = this.screenInfo.cutWidth
		const cutHeight = this.screenInfo.cutHeight
		const sources = await this.getScreenSources(cutWidth, cutHeight)

		this.listenEsc()

		// 当前鼠标位置
		const mouseX = screen.getCursorScreenPoint().x
		const mouseY = screen.getCursorScreenPoint().y

		if (this.multiScreen) {
			for (let i = 0; i < sources.length; i++) {
				const win = this.captureWins[i]

				const source = sources[i]
				const sourcePng = source.thumbnail.toJPEG(100)

				const width = this.screenInfo[source.display_id].width
				const height = this.screenInfo[source.display_id].height
				const actuallyWidth = source.thumbnail.getSize().width
				const actuallyHeight = source.thumbnail.getSize().height

				win.webContents.send(events.screenSourcesToPng, {
					toPngSource: sourcePng,
					width,
					height,
					actuallyWidth,
					actuallyHeight,
					mouseX,
					mouseY
				})

				// 设置窗口可以在全屏窗口之上显示。
				win.setVisibleOnAllWorkspaces(true)
				win.setAlwaysOnTop(true, 'screen-saver')
				win.setBackgroundColor('#00000000')
				setTimeout(() => {
					// 等资源传到渲染线程再打开截图
					win.show()
				}, 0)
			}
		} else {
			const currentFocusDisplay = this.getCurrentFocusDisplay()
			const source = sources.filter(
				v => v.display_id === currentFocusDisplay.id.toString()
			)[0]
			const win = this.captureWins.filter(v => {
				return v.displayId === currentFocusDisplay.id
			})[0]

			const width = this.screenInfo[source.display_id].width
			const height = this.screenInfo[source.display_id].height
			const actuallyHeight = source.thumbnail.getSize().height
			const actuallyWidth = source.thumbnail.getSize().width

			win.webContents.send(events.screenSourcesToPng, {
				toPngSource: source.thumbnail.toJPEG(1),
				width: width,
				height: height,
				actuallyWidth,
				actuallyHeight,
				mouseX,
				mouseY
			})

			// 设置窗口可以在全屏窗口之上显示。
			win.setVisibleOnAllWorkspaces(true)
			win.setAlwaysOnTop(true, 'screen-saver')
			win.setBackgroundColor('#00000000')
			win.show()
		}
	}

	/**
	 * 绑定窗口隐藏事件
	 */
	private bindHide() {
		ipcMain.on(events.close, () => {
			this.hide(true)
		})
	}

	hide(autoRunReopen?: boolean) {
		this.handleCaptureWins.forEach(v => {
			v.setVisibleOnAllWorkspaces(false)
			v.hide()
			v.webContents.send(events.close)
			v.setBackgroundColor('#30000000')
		})
		this.shortcuting = false
		this.unListenEsc()
		if (autoRunReopen && require('os').platform() !== 'darwin') {
			this.reopen()
		}
		if (this.onHide) {
			this.onHide()
		}
	}

	/**
	 * 重新打开，win上面用获取的截图有问题
	 */
	private reopen() {
		this.handleCaptureWins.forEach(v => {
			v.close()
		})
		this.captureWins = []
		this.initWin()
	}

	/**
	 * 监听下载事件
	 */
	private bindDownload() {
		ipcMain.on(events.download, (_, { dataURL }) => {
			this.hide()
			const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '')
			const dataBuffer = Buffer.from(base64Data, 'base64')
			const filename =
				this.downloadFileprefix + new Date().getTime() + '.png'
			const path = dialog.showSaveDialogSync({
				defaultPath: filename
			})
			if (!path) {
				return console.log('取消下载')
			}
			try {
				require('fs').writeFileSync(path, dataBuffer)
			} catch (err) {
				console.log('下载失败：' + err)
			}
			if (require('os').platform() !== 'darwin') {
				this.reopen()
			}
		})
	}

	/**
	 * 绑定剪贴板事件
	 */
	private bindClipboard() {
		ipcMain.on(events.clipboard, (_, dataURL) => {
			const data = nativeImage.createFromDataURL(dataURL)
			clipboard.writeImage(data)
			if (typeof this.onClipboard === 'function') {
				this.onClipboard(dataURL)
			}
			this.hide(true)
		})
	}

	/**
	 * 监听接收的操作截图的显示器id
	 */
	private listenCapturingDisplayId() {
		ipcMain.on(events.setCapturingDisplayId, (_, displayId: number) => {
			this.handleCaptureWins.forEach(v => {
				v.webContents.send(events.receiveCapturingDisplayId, displayId)
			})
		})
	}

	/**
	 * 获取显示器资源
	 */
	private getScreenSources: (
		width: number,
		height: number
	) => Promise<Electron.DesktopCapturerSource[]> = (
		width: number,
		height: number
	) => {
		return new Promise((resolve, reject) => {
			let desktopCapture = (process as any)
				.electronBinding('desktop_capturer')
				.createDesktopCapturer()

			const stopRunning = () => {
				if (desktopCapture) {
					desktopCapture.emit = null
					desktopCapture = null
				}
			}
			const emitter = new EventEmitter()
			emitter.once(
				'finished',
				(_, sources: Electron.DesktopCapturerSource[]) => {
					stopRunning()
					resolve(sources)
				}
			)
			desktopCapture.emit = emitter.emit.bind(emitter)
			desktopCapture.startHandling(
				false,
				true,
				{ width: width, height: height },
				true
			)
		})
	}

	/**
	 * 监听esc退出
	 */
	private listenEsc = () => {
		globalShortcut.register('esc', () => {
			this.hide(true)
		})
	}

	/**
	 * 取消监听esc退出
	 */
	private unListenEsc = () => {
		globalShortcut.unregister('esc')
	}

	/**
	 * 绑定截图快捷键
	 */
	private bindKey = () => {
		if (this.key) {
			globalShortcut.register(this.key, () => {
				this.show()
			})
		}
	}
	/**
	 * 更新快捷键
	 */
	updateBindKey = (key: string) => {
		if (key) {
			try {
				if (this.key) {
					globalShortcut.unregister(this.key)
				}
				this.key = key
				globalShortcut.register(key, () => {
					this.show()
				})
			} catch {
				this.key = ''
			}
		} else {
			try {
				globalShortcut.unregister(this.key)
				this.key = key
			} catch {
				this.key = ''
			}
		}
	}

	/**
	 * 监听显示器数量变化
	 */
	listenDisplayNumChange = () => {
		screen.on('display-metrics-changed', () => {
			console.log('重新初始化')
			this.initWin()
		})
	}
}
