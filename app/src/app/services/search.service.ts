import { inject, Injectable } from "@angular/core";
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { GrpcTransportService } from "@app/services/grpc-transport.service";

import { Chat } from "kavka-core/model/chat/v1/chat_pb";
import { User } from "kavka-core/model/user/v1/user_pb";
import { SearchService as KavkaSearchService } from "kavka-core/search/v1/search_connect";

@Injectable({ providedIn: "root" })
export class SearchService {
    private client: PromiseClient<typeof KavkaSearchService>;

    constructor() {
        const transport = inject(GrpcTransportService).transport;
        this.client = createPromiseClient(KavkaSearchService, transport);
    }

    Search(input: string) {
        return new Promise<{ users: User[]; chats: Chat[] }>((resolve, reject) => {
            this.client
                .search({ input })
                .then(response => {
                    resolve({
                        users: response.result.users,
                        chats: response.result.chats,
                    });
                })
                .catch((e: Error) => {
                    console.error("[SearchService] Search failed", e.message);
                    reject(e);
                });
        });
    }
}
