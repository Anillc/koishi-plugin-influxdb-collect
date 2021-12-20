import { Context, EventMap } from 'koishi'
import type {} from 'koishi-plugin-influxdb'

interface Config {
    mesurementName: string
}

export const name = 'influxdb-collect'

export function apply(ctx: Context, config: Config) {
    config = {
        mesurementName: 'koishi',
        ...config
    }
    ctx.using(['influxdb'], () => {
        ctx.plugin(collect, config)
    })
}

function collect(ctx: Context, config: Config) {
    ctx.on('message', (payload) => {
        let pointBuilder = ctx.influxdb.point(config.mesurementName)
            .tag('user', payload.userId)
            .tag('platform', payload.platform)
            .stringField('message', payload.content)
        if(payload.channelId) {
            pointBuilder.tag('channel', payload.channelId)
        }
        if(payload.guildId) {
            pointBuilder.tag('guilId', payload.guildId)
        }
        pointBuilder.write()
    })
    ctx.before('command', (argv) => {
        let pointBuilder = ctx.influxdb.point(config.mesurementName)
            .tag('command', argv.command.name)
            .tag('user', argv.session.userId)
            .stringField('command', argv.session.content)
        if(argv.session.channelId) {
            pointBuilder.tag('channel', argv.session.channelId)
        }
        if(argv.session.guildId) {
            pointBuilder.tag('guild', argv.session.guildId)
        }
        pointBuilder.write()
    })
}