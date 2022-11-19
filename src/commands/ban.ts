import { PermissionFlagsBits, SlashCommandBuilder, TextBasedChannel } from 'discord.js'
import { Command } from '@/types'
import { BAN } from '@/defines/commands.json'
import { PUNISHMENTS_CHANNEL } from '@/defines/ids.json'
import { embedTemplate } from '@/utils'

export const useBan = (): Command => {
  const data = new SlashCommandBuilder()
    .setName(BAN.TITLE)
    .setDescription(BAN.DESCRIPTION)
    .setDMPermission(false)
    .addUserOption((option) => option.setName('member').setDescription('Usuário a ser banido.').setRequired(true))
    .addStringOption((option) =>
      option.setName('reason').setDescription('Texto que irá aparecer no anúncio').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.BanMembers)

  return [
    data,
    async (interaction, client) => {
      const author = interaction.user

      const user = interaction.options.getUser('member')
      const reason = interaction.options.get('reason')

      if (!user || !reason) {
        return
      }

      try {
        await interaction?.guild?.members.ban(user)
      } catch (e) {
        await interaction.reply({ content: 'O usuário em questão não pode ser banido!', ephemeral: true })

        return
      }

      const embed = embedTemplate({
        title: '``🚔`` » Punição',
        target: {
          user,
          icon: true,
        },
        author,
        fields: [
          [
            { name: '``👤`` **Usuário punido:**', value: `**${user!.username}**` },
            { name: '``📄`` **Tipo:**', value: 'Banimento' },
            { name: '``📣`` **Motivo:**', value: (reason.value as string) || 'Não Inferido.' },
          ],
        ],
      })

      const channel = (client.channels.cache.get(PUNISHMENTS_CHANNEL.id) as TextBasedChannel) || interaction.channel

      await channel?.send({ content: `Usuário ${user.id} Banido!`, embeds: [embed] })

      await interaction.reply({ content: 'Sucesso!', ephemeral: true })
    },
  ]
}
