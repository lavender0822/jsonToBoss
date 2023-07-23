const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx');

const inputFilesPath = path.join(__dirname, '/json');
const seedFilesPath = path.join(__dirname, '/seed');
const bossFilesPath = path.join(__dirname, '/boss');

const inputFiles = fs.readdirSync(inputFilesPath);
const seedFiles = fs.readdirSync(seedFilesPath);
const bossFiles = fs.readdirSync(bossFilesPath);
let seedList = [];
let bossList = [];

for (let i in inputFiles) {
    if (!seedFiles.includes(inputFiles[i].replace('json', 'xlsx'))) {
        seedList.push(inputFiles[i]);
    }
    if (!bossFiles.includes(inputFiles[i].replace('json', 'xlsx'))) {
        bossList.push(inputFiles[i]);
    }
}

seedList.forEach(fileName => {
    const file = JSON.parse(fs.readFileSync(`${inputFilesPath}/${fileName}`, 'utf8'));
    let data = [];
    file.raids.forEach(levels => {
        let _data = [];
        levels.spawn_sequence.forEach(titan => {
            _data.push(titan);
        })
        data.push(_data);
    })
    const buffer = xlsx.build([{name: 'seed', data}]);
    fs.writeFileSync(`${seedFilesPath}/${fileName.replace('json', 'xlsx')}`, buffer)
    console.log('seed done');
})

bossList.forEach(fileName => {
    const file = JSON.parse(fs.readFileSync(`${inputFilesPath}/${fileName}`, 'utf8'));
    let data = [];
    file.raids.forEach(levels => {
        let _data = [];
        let buff = [];
        for(let i = 0; i < 5; i++) {
            _data.push('');
        }
        _data.push(levels.level);
        _data.push('');
        _data.push(levels.raid_info_expire_at);
        _data.push(levels.raid_info_valid_from);
        _data.push(levels.tier);
        data.push(_data);
        _data = [];
        if (levels.area_buffs) {
            buff.push(levels.area_buffs[0].bonus_amount);
            buff.push(levels.area_buffs[0].bonus_type);
        }
        let titans = [];
        levels.titans.forEach(boss => {
            if (!titans.includes(boss.enemy_name)) {
                for(let i = 0; i < 3; i++) {
                    _data.push('');
                }
                _data.push(boss.enemy_id);
                _data.push(boss.enemy_name);
                for(let i = 0; i < 5; i++) {
                    _data.push('');
                }
                _data.push(boss.total_hp);
                data.push(_data);
                _data = [];
                titans.push(boss.enemy_name);
                boss.parts.forEach(part => {
                    let partList = [];
                    for(let i = 0; i < 2; i++) {
                        partList.push('');
                    }
                    if(part.cursed !== undefined) {
                        partList.push(part.cursed);
                    } else {
                        partList.push('');
                    }
                    for(let i = 0; i < 3; i++) {
                        partList.push('');
                    }
                    partList.push(part.part_id);
                    for(let i = 0; i < 3; i++) {
                        partList.push('');
                    }
                    partList.push(part.total_hp);
                    data.push(partList);
                    partList = [];
                })
                if (boss.area_debuffs) {
                    _data.push(boss.area_debuffs[0].bonus_amount);
                    _data.push(boss.area_debuffs[0].bonus_type);
                    data.push(_data);
                    _data = [];
                }
                if (boss.cursed_debuffs) {
                    _data.push(boss.cursed_debuffs[0].bonus_amount);
                    _data.push(boss.cursed_debuffs[0].bonus_type);
                    data.push(_data);
                    _data = [];
                }
            }
        })
        if (buff.length > 0) {
            data.push(buff);
        }
    })
    const buffer = xlsx.build([{name: 'boss', data}]);
    fs.writeFileSync(`${bossFilesPath}/${fileName.replace('json', 'xlsx')}`, buffer);
    console.log('boss done');
})

// app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`);
//     return
// })

module.exports = app;