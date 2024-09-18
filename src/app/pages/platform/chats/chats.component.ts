import { Component, HostListener, inject, ViewChild } from "@angular/core";
import { ActiveChatComponent } from "@components/active-chat/active-chat.component";
import { ChatItemComponent } from "@components/chat-item/chat-item.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgScrollbarModule } from "ngx-scrollbar";
import { Store } from "@ngrx/store";
import * as ChatSelector from "@store/chat/chat.selectors";
import * as AuthSelector from "@store/auth/auth.selectors";
import * as ConnectivitySelector from "@store/connectivity/connectivity.selectors";
import { ChatActions } from "@app/store/chat/chat.actions";
import { ChatService } from "@services/chat.service";
import { IChatItem } from "@app/models/chat";
import { take } from "rxjs";
import { SearchService } from "@app/services/search.service";
import { Chat, ChatType } from "kavka-core/model/chat/v1/chat_pb";
import { User } from "kavka-core/model/user/v1/user_pb";
import { ChatItemSkeletonComponent } from "@app/components/chat-item/chat-item-skeleton/chat-item-skeleton.component";

@Component({
    selector: "app-chats",
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        ActiveChatComponent,
        ChatItemComponent,
        ChatItemSkeletonComponent,
        NgScrollbarModule,
    ],
    templateUrl: "./chats.component.html",
    styleUrl: "./chats.component.scss",
})
export class ChatsComponent {
    private store = inject(Store);
    private searchService = inject(SearchService);
    chatService = inject(ChatService);

    isOnline = true;

    activeChat: Chat | null;
    activeUser: User | null;

    chatItemsLoaded = false;
    chatItems: IChatItem[] = [];
    filteredChatItems: IChatItem[] = [];

    search: {
        input: "";
        loading: boolean;
        chats: IChatItem[];
        users: User[];
        finalResult: IChatItem[];
    };

    @ViewChild("createChatModal") createChatModalRef;
    createChatMenuActiveTab: string | undefined;
    channelTitleInput = "";
    channelUsernameInput = "";
    groupTitleInput = "";
    groupUsernameInput = "";

    constructor() {
        this.clearSearchResult();

        this.store.select(ChatSelector.selectActiveChat).subscribe(chat => {
            if (chat !== null || chat !== undefined) {
                this.activeChat = chat;
                return;
            }

            this.activeChat = null;
        });

        this.chatService.GetUserChats().then(chats => {
            this.store.dispatch(ChatActions.set({ chats }));

            this.filteredChatItems = this.chatItems;
            this.chatItemsLoaded = true;
        });

        this.store.select(ChatSelector.selectChatItems).subscribe(chats => {
            this.chatItems = chats;
            this.filteredChatItems = this.filterChatsList(this.search.input, chats);
        });

        this.store.select(AuthSelector.selectActiveUser).subscribe(activeUser => {
            this.activeUser = activeUser;
        });

        this.store.select(ConnectivitySelector.selectIsOnline).subscribe(isOnline => {
            this.isOnline = isOnline;
        });
    }

    activateUncreatedChat(item: IChatItem) {
        this.chatService.activateUncreatedChat(item, this.search.users);
    }

    submitCreateChannel() {
        this.chatService
            .CreateChannel(this.channelTitleInput, this.channelUsernameInput)
            .then(chat => {
                this.store.dispatch(ChatActions.add({ chat }));
            });

        this.closeCreateChatModal();
    }

    submitCreateGroup() {
        this.chatService.CreateGroup(this.groupTitleInput, this.groupUsernameInput).then(chat => {
            this.store.dispatch(ChatActions.add({ chat }));
        });

        this.closeCreateChatModal();
    }

    closeCreateChatModal() {
        this.createChatModalRef.nativeElement.querySelector(".modal-overlay").click();
        this.createChatMenuActiveTab = undefined;
        this.channelTitleInput = "";
        this.channelUsernameInput = "";
        this.groupTitleInput = "";
        this.groupUsernameInput = "";
    }

    filterChatsList(input: string, sourceList: IChatItem[]): IChatItem[] {
        if (input.trim().length == 0) {
            return sourceList;
        }

        const temp: IChatItem[] = [];

        sourceList.forEach(item => {
            if (item.title.toLowerCase().indexOf(input.toLowerCase()) > -1) {
                temp.push(item);
            }
        });

        return temp;
    }

    clearSearchResult() {
        this.search = {
            users: [],
            chats: [],
            input: "",
            loading: false,
            finalResult: [],
        };
    }

    onSearchInputChange() {
        this.filteredChatItems = this.filterChatsList(this.search.input, this.chatItems);

        if (this.search.input.trim().length > 0) {
            this.search.loading = true;

            if (this.search.input.trim().length >= 3) {
                this.searchService
                    .Search(this.search.input.trim())
                    .then(result => {
                        this.search.chats = result.chats as any as IChatItem[];
                        this.search.users = result.users;

                        this.store
                            .select(ChatSelector.selectChats)
                            .pipe(take(1))
                            .subscribe(chats => {
                                this.chatService
                                    .mergeChatItems(result.chats, result.users)
                                    .then(mergedChatItems => {
                                        this.search.finalResult = mergedChatItems;
                                    });
                            });
                    })
                    .catch(() => {});
            }
        } else {
            this.clearSearchResult();
        }

        setTimeout(() => {
            this.search.loading = false;
        }, 600);
    }

    @HostListener("window:keydown", ["$event"])
    onKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            event.preventDefault();

            this.store
                .select(ChatSelector.selectActiveChat)
                .pipe(take(1))
                .subscribe(activeChat => {
                    if (activeChat) {
                        this.store.dispatch(ChatActions.removeActiveChat());
                        return;
                    }

                    if (this.search.input.trim() != "") {
                        this.filteredChatItems = this.filterChatsList("", this.chatItems);
                        this.clearSearchResult();
                    }
                });
        }
    }
}
