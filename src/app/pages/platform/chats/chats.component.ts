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
import { convertChatsToChatItems, IChatItem } from "@app/models/chat";
import { take } from "rxjs";
import { SearchService } from "@app/services/search.service";
import { Chat, DirectChatDetail } from "kavka-core/model/chat/v1/chat_pb";
import { User } from "kavka-core/model/user/v1/user_pb";

@Component({
    selector: "app-chats",
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        ActiveChatComponent,
        ChatItemComponent,
        NgScrollbarModule,
    ],
    templateUrl: "./chats.component.html",
    styleUrl: "./chats.component.scss",
})
export class ChatsComponent {
    private chatService = inject(ChatService);
    private searchService = inject(SearchService);
    private store = inject(Store);

    isOnline = true;

    activeChat: Chat | null;
    activeUser: User | null;

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

    // Check it the chat does not exists in the local chats
    // we prepare to fetch the chat from the back-end and add to store
    activateUncreatedChat(chatId: string) {
        this.store
            .select(ChatSelector.selectChats)
            .pipe(take(1))
            .subscribe(localChats => {
                const chatIdx = localChats.findIndex(_chat => _chat.chatId === chatId);
                if (chatIdx !== -1) {
                    // exist
                    this.activateChat(chatId);
                }

                // fetch chat
                this.chatService.GetChat(chatId).then(fetchedChat => {
                    this.store.dispatch(ChatActions.setActiveChat({ chat: fetchedChat }));
                });
            });
    }

    activateChat(chatId: string) {
        this.store
            .select(ChatSelector.selectChat(chatId))
            .pipe(take(1))
            .subscribe(chat => {
                this.store.dispatch(ChatActions.setActiveChat({ chat }));
            });
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

    mergeLocalAndFetchedChats(
        localChatItems: IChatItem[],
        fetchResult: { users: User[]; chats: Chat[] }
    ) {
        return new Promise<IChatItem[]>(resolve => {
            const finalChatItems: IChatItem[] = [...localChatItems];

            this.store
                .select(ChatSelector.selectChats)
                .pipe(take(1))
                .subscribe(async localChats => {
                    if (fetchResult && fetchResult.chats !== undefined) {
                        await fetchResult.chats.forEach(chat => {
                            const alreadyExistIdx = localChatItems.findIndex(
                                _chat => _chat.chatId === chat.chatId
                            );
                            if (alreadyExistIdx === -1) {
                                finalChatItems.push(convertChatsToChatItems([chat])[0]);
                            }
                        });

                        fetchResult.users.forEach(user => {
                            const alreadyExistIdx = localChats.findIndex(_chat => {
                                return (
                                    (_chat.chatDetail.chatDetailType.value as DirectChatDetail)
                                        .userInfo.userId === user.userId
                                );
                            });
                            if (alreadyExistIdx === -1) {
                                finalChatItems.push({
                                    chatId: user.userId,
                                    title: user.name + " " + user.lastName,
                                    lastMessage: undefined,
                                });
                            }
                        });
                    }
                });

            resolve(finalChatItems);
        });
    }

    determineSearchResult(result: { users: User[]; chats: Chat[] }) {
        this.mergeLocalAndFetchedChats(this.filteredChatItems, result).then(merged => {
            this.search.finalResult = merged;
        });
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

                        this.determineSearchResult(result);
                    })
                    .catch(() => {
                        this.determineSearchResult(undefined);
                    });
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
