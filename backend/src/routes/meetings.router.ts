import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";

import Meeting from "../../../frontend/src/shared/classes/Meeting";
import {MeetingModel} from "../database/models.js";
import {authRestricted} from "../util/middleware/authMiddleware.js";

const meetingsRouter = express.Router();
meetingsRouter.use(authRestricted);
meetingsRouter.get("/", async (_req: Request, res: Response) => {
    try {
        const meetings = (await MeetingModel.find({}));
        meetings.map(meeting => meeting.toObject() as unknown as Meeting)

        res.status(200).send(meetings);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).send(error.message);
        } else {
            res.status(500).send('Unknown Error Occurred');
        }
    }
});

meetingsRouter.get("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {

        const query = { _id: new ObjectId(id) };
        const meeting = (await MeetingModel.findOne(query)) as Meeting;

        if (meeting) {
            res.status(200).send(meeting);
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
});

meetingsRouter.post("/", async (req: Request, res: Response) => {
    try {
        const {id, title} = req.body;
        const newMeeting = new MeetingModel ({
            _id: id,
            title
        })
        const result = await newMeeting.save();
        result
            ? res.status(201).json(result)
            : res.status(500).send("Failed to create a new meeting.");
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            res.status(400).send(error.message);
        }
        else res.status(400).send()
    }
});

meetingsRouter.put("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const query = { _id: new ObjectId(id) };
        const {title} = req.body;
        const updatedMeeting = {
            title
        }
        const result = await MeetingModel.updateOne(query, { $set: updatedMeeting });
        result
            ? res.status(200).send(`Successfully updated meeting with id ${id}`)
            : res.status(304).send(`Meeting with id: ${id} not updated`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(400).send(error.message);
        }
        console.error('Unknown Error at meeting PUT');
        res.status(400).send();
    }
});

meetingsRouter.delete("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const query = { _id: new ObjectId(id) };
        const result = await MeetingModel.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed meeting with id ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove meeting with id ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Meeting with id ${id} does not exist`);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(400).send(error.message);
        }
        console.error('Unknown Error at meeting DELETE');
        res.status(400).send();
    }
});
export default meetingsRouter