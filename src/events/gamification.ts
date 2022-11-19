import { ChannelType, GuildMember, Message, TextBasedChannel } from 'discord.js'
import { ofetch } from 'ofetch'
import { embedTemplate, getChannel, isPrivileged } from '@/utils'
import { GamificationPOST, He4rtClient } from '@/types'
import {
  BEGINNER_ROLE,
  INTERMEDIATE_ROLE,
  ADVANCED_ROLE,
  SUPREME_ROLE,
  HE4RT_ROLE,
  LEVELUP_CHANNEL,
  PRESENTATIONS_CHANNEL,
  COMMANDS_CHANNEL,
} from '@/defines/ids.json'

export const XPCounterAndPossibleLevelUp = (client: He4rtClient, message: Message) => {
  const member = message.member as GuildMember

  if (!member?.id) return

  const invalidChannels = [LEVELUP_CHANNEL, PRESENTATIONS_CHANNEL, COMMANDS_CHANNEL]

  if (message.channel.type === ChannelType.DM || invalidChannels.some((v) => v.id === message.channel.id)) return

  if (client.user?.id === message.author.id) return

  ofetch<GamificationPOST>(`${process.env.API_URL}/bot/gamification/levelup`, {
    headers: { Authorization: process.env.HE4RT_TOKEN },
    method: 'POST',
    body: {
      discord_id: member.id,
      message: message.content,
      donator: isPrivileged(member),
    },
  })
    .then(async (data) => {
      if (!data.is_levelup) return

      const lvl = parseInt(data.level, 10)

      const validLevelRole = {
        10: () => {
          member.roles.add(BEGINNER_ROLE.id)
        },
        20: () => {
          member.roles.add(INTERMEDIATE_ROLE.id)
        },
        30: () => {
          member.roles.add(ADVANCED_ROLE.id)
        },
        40: () => {
          member.roles.add(SUPREME_ROLE.id)
        },
        50: () => {
          member.roles.add(HE4RT_ROLE.id)
        },
      }[lvl]
      validLevelRole && validLevelRole()

      const embed = embedTemplate({
        title: `🆙 **${member.user.username}** subiu para o nível ${data.level}!`,
        target: {
          user: message.author,
          icon: true,
        },
      })

      const channel = getChannel({ id: LEVELUP_CHANNEL.id, client })

      await channel?.send({ content: `<@${message.author.id}>`, embeds: [embed] })
    })
    .catch(() => {})
}

export const gamificationListener = (client: He4rtClient, message: Message) => {
  XPCounterAndPossibleLevelUp(client, message)
}
