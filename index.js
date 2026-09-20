const http = require("http");
http.createServer((req, res) => res.end("Bot en ligne")).listen(process.env.PORT || 3000);

require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error("Il manque DISCORD_TOKEN, CLIENT_ID ou GUILD_ID dans les variables.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("inscription")
    .setDescription("S'inscrire et recevoir les informations en MP.")
].map(command => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(token);
  console.log("Enregistrement de la commande /inscription...");
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log("/inscription enregistrée avec succès !");
  } catch (error) {
    console.error("ÉCHEC enregistrement:", error?.rawError || error);
    throw error;
  }
}

client.once("ready", () => {
  console.log(`Bot connecté : ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "inscription") return;

  await interaction.deferReply({ ephemeral: true });

  try {
    await interaction.user.send(
      `👋 Salut ${interaction.user.username} !\n\n✅ Ton inscription est confirmée !\nTu recevras ici les prochaines informations.`
    );
    await interaction.editReply("✅ Inscription réussie ! Regarde tes messages privés.");
  } catch (error) {
    console.error("Impossible d'envoyer le MP :", error?.rawError || error);
    await interaction.editReply("❌ Je ne peux pas t'envoyer de MP. Vérifie que tes messages privés sont ouverts.");
  }
});

async function start() {
  try {
    await registerCommands();
    await client.login(token);
  } catch (error) {
    console.error("Erreur fatale :", error?.rawError || error);
    process.exit(1);
  }
}

start();
