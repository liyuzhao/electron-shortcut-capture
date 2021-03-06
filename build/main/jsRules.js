const { resolveUnderRootDir } = require('../utils')

module.exports = [
	{
		test: /\.js$/,
		loader: 'babel-loader'
	},
	{
		test: /\.ts(x?)$/,
		use: [
			{
				loader: 'ts-loader',
				options: {
					// disable type checker - we will use it in fork plugin
					transpileOnly: true,
					configFile: resolveUnderRootDir('build/main/tsconfig.json')
				}
			}
		]
	}
]
