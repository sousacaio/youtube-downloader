#!/usr/bin/env node
/*em sistemas *nix, este script seja interpretado utilizando node */
const { join } = require('path');
const fs = require('fs');
const todosPath = join(__dirname, 'todos.json');
const inquirer = require('inquirer');
const program = require('commander');
const package = require('./package.json');
const chalk = require('chalk');
const Table = require('cli-table');
const ytdl = require('ytdl-core');
const label = chalk.bold.gray;
const util = require('./utils');


const showTodoTable = (data) => {
    const table = new Table({
        head: ['id', 'url', 'titulo', 'status'],
        colWidths: [10, 20, 20, 20]
    });
    data.map((todo, index) =>
        table.push(
            [index, todo.url, todo.titulo, todo.done ? chalk.green('Concluido') : 'pendente']
        )
    );
    console.log(table.toString());
}
const getJson = (path) => {
    const data = fs.existsSync(path) ? fs.readFileSync(path) : [];
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};
const saveJson = (path, data) => fs.writeFileSync(path, JSON.stringify(data, null, '\t'));

const printVideoInfo = (info, live) => {
    console.log(label('Titulo: ') + info.title);
    console.log(label('Autor: ') + info.author.name);
    console.log(label('Média de likes: ') +
        info.player_response.videoDetails.averageRating);
    console.log(label('Views: ') +
        info.player_response.videoDetails.viewCount);
    if (!live) {
        console.log(label('Duração: ') + util.toHumanTime(info.length_seconds));
    }
};
program.version(package.version);

program
    .command('url [url]')
    .description('Adiciona um to-do')
    .action(async (url) => {
        const isValid = ytdl.validateURL(url)
        if (isValid) {
            console.log(`${chalk.green('>> Procurando vídeo...')}`);
            ytdl.getInfo(url, { debug: program.debug }, async (err, info) => {
                if (err) {
                    console.error(err.message);
                    process.exit(1);
                    return;
                }
                printVideoInfo(info, info.formats.some(f => f.live));
                let isThisVideo = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'yes',
                        message: 'Esse é o seu vídeo?'
                    }
                ]);
                if (isThisVideo.yes) {
                    console.log(`${chalk.green('\n>> Baixando \n')}`);
                    ytdl(url, { filter: 'audioonly' }).pipe(fs.createWriteStream(`${info.title}.mp3`));
                    const data = getJson(todosPath);
                    data.push({
                        url: url,
                        done: true,
                        titulo: info.title,
                        autor: info.author
                    });
                    saveJson(todosPath, data);
                }

            });
        } else {
            console.log(`${chalk.red('\n>> Uma url válida é necessária \n')}`);
        }
    });

program
    .command('list')
    .description('Lista vídeos baixados')
    .action(() => {
        const data = getJson(todosPath);
        showTodoTable(data);
    });
program.parse(process.argv);