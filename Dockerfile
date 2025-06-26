# Versão do Node usada no projeto
FROM node:22

# Definindo o diretório de trabalho dentro do container
WORKDIR /app

# Copiando os arquivos de configuração do projeto e instalando as dependências
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Instalando o Prisma CLI globalmente
RUN npx prisma generate

# Copiando o restante dos arquivos do projeto
COPY . .

# Expondo a porta que a aplicação irá rodar
EXPOSE 3000

# Comando para iniciar a aplicação
#
CMD ["npm", "run", "dev"]
