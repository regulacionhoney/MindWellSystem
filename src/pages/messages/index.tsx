import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { TextArea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/services/api";
import { messageApi } from "@/services/messageApi";
import { useFetch } from "@/hooks/use-fetch";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Conversation, Message, UserRef } from "@/types";

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data: conversations, loading: conversationsLoading, error: conversationsError, refetch: refetchConversations } =
    useFetch(() => messageApi.conversations(), []);

  const { data: contacts } = useFetch(() => messageApi.contacts(), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedId]);

  const peerIdOf = (conversation: Conversation): number =>
    conversation.contact?.id ?? (conversation.sender_id === user?.id ? conversation.receiver_id : conversation.sender_id);

  const contactNameOf = (conversation: Conversation): string =>
    conversation.contact?.name ??
    (conversation.sender_id === user?.id ? conversation.receiver?.name : conversation.sender?.name) ??
    "Contact";

  const openConversation = async (conversation: Conversation) => {
    const peer = peerIdOf(conversation);
    setSelectedId(peer);
    setMessagesLoading(true);
    setMessagesError(null);
    try {
      const page = await messageApi.conversation(peer, { per_page: 200 });
      setMessages(page.data);
      void messageApi.markConversationRead(peer).then(() => refetchConversations());
    } catch (error) {
      setMessagesError(getErrorMessage(error));
    } finally {
      setMessagesLoading(false);
    }
  };

  const selectContact = (contact: UserRef) => {
    setNewModalOpen(false);
    const existing = conversations?.find((conversation) => peerIdOf(conversation) === contact.id);
    if (existing) {
      void openConversation(existing);
      return;
    }
    setSelectedId(contact.id);
    setMessages([]);
    setMessagesError(null);
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || selectedId === null || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const sent = await messageApi.sendMessage({ receiver_id: selectedId, content });
      setMessages((prev) => [...prev, sent]);
      setDraft("");
      refetchConversations();
    } catch (error) {
      setSendError(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const selectedContact: UserRef | undefined =
    selectedId === null
      ? undefined
      : contacts?.find((contact) => contact.id === selectedId) ??
        (conversations
          ?.map((conversation) => ({ id: peerIdOf(conversation), name: contactNameOf(conversation), avatar: conversation.contact?.avatar }))
          .find((conversation) => conversation.id === selectedId) as UserRef | undefined);

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Chat with your counselor or students."
        actions={
          <Button variant="secondary" onClick={() => setNewModalOpen(true)}>
            <Icon name="plus" className="size-4" />
            New message
          </Button>
        }
      />

      <Card>
        <CardBody className="p-0">
          <div className="grid h-[75vh] grid-cols-1 lg:h-[68vh] lg:grid-cols-[320px_1fr] lg:divide-x lg:divide-gray-100">
            <div className={cn("flex min-h-0 flex-col", selectedId !== null && "hidden lg:flex")}>
              {conversationsLoading && !conversations ? (
                <div className="flex flex-1 justify-center py-12">
                  <Spinner className="size-7 text-emerald-700" />
                </div>
              ) : conversationsError ? (
                <p className="p-4 text-sm text-red-600">{conversationsError}</p>
              ) : !conversations || conversations.length === 0 ? (
                <div className="flex-1">
                  <EmptyState
                    icon={<Icon name="message" className="size-10" />}
                    title="No conversations yet"
                    description="Start a conversation with a counselor to get help."
                    action={
                      <Button size="sm" variant="secondary" onClick={() => setNewModalOpen(true)}>
                        Start a conversation
                      </Button>
                    }
                  />
                </div>
              ) : (
                <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
                  {conversations.map((conversation) => {
                    const peer = peerIdOf(conversation);
                    const unread = conversation.unread_count ?? 0;
                    return (
                      <li key={peer}>
                        <button
                          type="button"
                          onClick={() => void openConversation(conversation)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                            peer === selectedId ? "bg-emerald-50/70" : "hover:bg-gray-50",
                          )}
                        >
                          <Avatar name={contactNameOf(conversation)} src={conversation.contact?.avatar} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {contactNameOf(conversation)}
                              </p>
                              <span className="shrink-0 text-xs text-gray-400">{timeAgo(conversation.sent_at)}</span>
                            </div>
                            <p className="truncate text-sm text-gray-500">{conversation.content}</p>
                          </div>
                          {unread > 0 && (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                              {unread}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className={cn("flex min-h-0 flex-col", selectedId === null && "hidden lg:flex")}>
              {selectedId === null ? (
                <EmptyState
                  icon={<Icon name="message" className="size-10" />}
                  title="Select a conversation"
                  description="Choose a contact on the left or start a new message to begin chatting."
                />
              ) : (
                <>
                  <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3">
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="lg:hidden"
                      aria-label="Back to conversations"
                      onClick={() => setSelectedId(null)}
                    >
                      <Icon name="chevron-left" className="size-4" />
                    </Button>
                    <Avatar name={selectedContact?.name ?? "Contact"} src={selectedContact?.avatar} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{selectedContact?.name ?? "Contact"}</p>
                      <p className="truncate text-xs text-gray-400">{selectedContact?.email ?? ""}</p>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                    {messagesLoading ? (
                      <div className="flex justify-center py-8">
                        <Spinner className="size-6 text-emerald-700" />
                      </div>
                    ) : messagesError ? (
                      <p className="text-sm text-red-600">{messagesError}</p>
                    ) : messages.length === 0 ? (
                      <EmptyState
                        icon={<Icon name="mail" className="size-8" />}
                        title="No messages yet"
                        description="Say hello to start the conversation."
                        className="py-8"
                      />
                    ) : (
                      messages.map((message) => {
                        const own = message.sender_id === user?.id;
                        return (
                          <div key={message.id} className={cn("flex", own ? "justify-end" : "justify-start")}>
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm",
                                own ? "rounded-br-sm bg-emerald-600 text-white" : "rounded-bl-sm bg-gray-100 text-gray-900",
                              )}
                            >
                              <p className="whitespace-pre-line break-words text-sm">{message.content}</p>
                              <p className={cn("mt-1 text-xs", own ? "text-emerald-100" : "text-gray-400")}>
                                {timeAgo(message.sent_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <div className="shrink-0 border-t border-gray-100 p-3">
                    {sendError && <p className="mb-2 text-xs text-red-600">{sendError}</p>}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <TextArea
                          rows={2}
                          placeholder="Type a message..."
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              void handleSend();
                            }
                          }}
                        />
                      </div>
                      <Button onClick={() => void handleSend()} loading={sending} disabled={!draft.trim()}>
                        Send
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <Modal open={newModalOpen} onClose={() => setNewModalOpen(false)} title="New message">
        {!contacts || contacts.length === 0 ? (
          <EmptyState
            icon={<Icon name="users" className="size-8" />}
            title="No contacts available"
            description="There are no other active users to message right now."
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <li key={contact.id}>
                <button
                  type="button"
                  onClick={() => selectContact(contact)}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-emerald-50"
                >
                  <Avatar name={contact.name} src={contact.avatar} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{contact.name}</p>
                    <p className="truncate text-xs text-gray-400">{contact.email}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}