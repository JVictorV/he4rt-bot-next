import { SlashCommandBuilder, RestOrArray, APIEmbedField, GuildMember } from 'discord.js'
import { Command, RankingGET } from '@/types'
import { RANKING } from '@/defines/commands.json'
import { COLORS } from '@/defines/values.json'
import { embedTemplate, isPresentedMember, reply } from '@/utils'
import { HexColorString } from 'discord.js'

export const useRanking = (): Command => {
  const data = new SlashCommandBuilder()
    .setName(RANKING.TITLE)
    .setDescription(RANKING.DESCRIPTION)
    .setDMPermission(false)
    .addNumberOption((option) => option.setName('page').setDescription('Qual página deseja ver?').setRequired(true))

  return [
    data,
    async (interaction, client) => {
      const member = interaction.member as GuildMember
      const page = (interaction.options.get('page')?.value as number) || 1

      if (!isPresentedMember(member)) {
        await reply(interaction).errorMemberIsNotPresented()

        return
      }

      client.api.ranking.general
        .get<RankingGET>({
          page,
        })
        .then(async ({ data: members }) => {
          const fields: RestOrArray<APIEmbedField> = []

          members.forEach((member, index) => {
            fields.push({
              name: `${index + 1 + (page - 1) * 10}° | ${(member.nickname as string) || 'Conta Excluída'}`,
              value: `Level: ${member.level} - Exp: ${member.current_exp}`,
              inline: false,
            })
          })

          if (fields.length === 0) {
            await reply(interaction).errorPaginationFail()

            return
          }

          const embed = embedTemplate({
            title: `🏆 » Ranking - Página ${page}`,
            color: COLORS.WARNING as HexColorString,
            fields: [fields],
          })

          await interaction.reply({ embeds: [embed], ephemeral: true })
        })
        .catch(async () => {
          await reply(interaction).error()
        })
    },
  ]
}
