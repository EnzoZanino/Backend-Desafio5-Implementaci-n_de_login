import { messageModel } from "../../models/message.model.js";

class MessageDao {
    constructor() {
        this.model = messageModel;
    }

    async getAllMessages() {
        return await this.model.find();
    }

    async getMessageById(id) {
        return await this.model.findById(id);
    }

    async createMessage(message) {
        return await this.model.create(message);
    }

    async updateMessage(id, message) {
        return await this.model.findByIdAndUpdate(id, message);
    }

    async deleteMessage(id) {
        return await this.model.findByIdAndDelete(id);
    }
}

export default new MessageDao();
