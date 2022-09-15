import express from "express";
import cors from 'cors';
import { PrismaClient } from "@prisma/client";
import { convertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMinutesToHourString } from "./utils/convert-hour-minutes-to-string";

const app = express();
app.use(express.json())
app.use(cors())

const prisma = new PrismaClient({
    log: ['query']
});



app.get('/ads', (request, response) => {
    return response.json([
        { id: '1', name: 'anuncio 1' },
        { id: '2', name: 'anuncio 2' },
        { id: '3', name: 'anuncio 3' },
        { id: '4', name: 'anuncio 4' },
        { id: '5', name: 'anuncio 5' },
    ])
});

app.get('/ads/:id/discord', async (request, response) => {
    const AD_ID:  any = request.params.id;
    const AD: any = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true
        },
        where: {
            id: AD_ID
        }
    })
    return response.json({
        discord: AD.discord
    });
});

app.get('/games/:id/ads/', async (request, response) => {
    const GAME_ID = request.params.id;
    const ADS = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
        },
        where: {
            gameId: GAME_ID,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return response.json(ADS.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart:convertMinutesToHourString(ad.hourStart),
            hourEnd:convertMinutesToHourString(ad.hourEnd)
        }
    }));
});

app.post('/games/:id/ads', async (request, response) => {
    const GAME_ID = request.params.id;
    const BODY = request.body;
    const AD = await prisma.ad.create({
        data: {
            gameId: GAME_ID,
            name: BODY.name,
            yearsPlaying: BODY.yearsPlaying,
            discord: BODY.discord,
            weekDays: BODY.weekDays.join(','),
            hourStart: convertHourStringToMinutes(BODY.hourStart),
            hourEnd: convertHourStringToMinutes(BODY.hourEnd),
            useVoiceChannel: BODY.useVoiceChannel,
        }
    })
    return response.status(201).json(AD);
});

app.get('/games', async (request, response) => {
    const GAMES = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true
                }
            }
        }
    })
    return response.json(GAMES);
});

app.listen(3333)