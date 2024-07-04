import { BaseController } from "./baseController.js";
import CryptoJS from 'crypto-js';
import { URLSearchParams } from 'url';
import fetch from 'node-fetch';

export default class VideoController extends BaseController {
    constructor() {
        super(); 
    }

    // display api

    static async getVideos(req, res) {
        const { accessToken } = req.cookies;
        const queryParams = new URLSearchParams({
            count: 10,
            cursor: 0,
            type: 1
        });
        const videoResponse = await fetch(`https://open.tiktokapis.com/item/list/?${queryParams}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const videoData = await videoResponse.json();
        res.status(200).send(videoData);
    }

    static async getVideoById(req, res) {
        const { accessToken } = req.cookies;
        const { id } = req.params;
        const queryParams = new URLSearchParams({
            item_id: id
        });
        const videoResponse = await fetch(`https://open.tiktokapis.com/item/detail/?${queryParams}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const videoData = await videoResponse.json();
        res.status(200).send(videoData);
    }

}