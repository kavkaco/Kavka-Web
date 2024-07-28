import { inject, Injectable } from "@angular/core";
import { IUser } from "@app/models/auth";
import { Store } from "@ngrx/store";
import * as AuthSelector from "@store/auth/auth.selectors"
import { EventsService as KavkaEventsService } from '/home/tahadostifam/Code/Kavka-Core/protobuf/gen/es/protobuf/events/v1/events_connect';
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { GrpcTransportService } from "@app/services/grpc-transport.service";
import { CreateChannelResponse } from "../../../../Kavka-Core/protobuf/gen/es/protobuf/chat/v1/chat_pb";
import { ChatType } from "../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb";

@Injectable({ providedIn: 'root' })
export class EventsService {
    private store = inject(Store)
    private activeUser: IUser | undefined;
    private client: PromiseClient<typeof KavkaEventsService>;

    constructor() {
        this.store.select(AuthSelector.selectActiveUser).subscribe((user) => {
            this.activeUser = user;
        })

        const transport = inject(GrpcTransportService).transport;
        this.client = createPromiseClient(KavkaEventsService, transport);
    }

    async SubscribeEventsStream() {
        const events = this.client.subscribeEventsStream({})

        for await (const event of events) {
            // switch (event.name) {
            //     case "add-chat":
            //         console.log(event.payload);
            //         break;

            //     default:
            //         break;
            // }    

            console.log(event.name, event.payload);
        }
    }

}

