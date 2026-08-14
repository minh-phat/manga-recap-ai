"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecapScriptsService = void 0;
const common_1 = require("@nestjs/common");
const mongodb_1 = require("mongodb");
const database_providers_1 = require("../database/database.providers");
let RecapScriptsService = class RecapScriptsService {
    db;
    collection;
    constructor(db) {
        this.db = db;
        this.collection = this.db.collection('recapScripts');
    }
    async create(script) {
        const result = await this.collection.insertOne(script);
        return { ...script, _id: result.insertedId };
    }
    findAllByProject(projectId) {
        return this.collection
            .find({ projectId: new mongodb_1.ObjectId(projectId) })
            .sort({ createdAt: -1 })
            .toArray();
    }
    async findOne(id) {
        const script = await this.collection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!script) {
            throw new common_1.NotFoundException('Recap script not found');
        }
        return script;
    }
};
exports.RecapScriptsService = RecapScriptsService;
exports.RecapScriptsService = RecapScriptsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_providers_1.MONGO_DB)),
    __metadata("design:paramtypes", [mongodb_1.Db])
], RecapScriptsService);
//# sourceMappingURL=recap-scripts.service.js.map