import { AI } from "@/app/actions";
import { ChatProvider } from "@/components/chat/context";
import { Header } from "@/components/chat/header";
import { ShareConversation } from "@/components/chat/share";
import { UnauthorizedError } from "@/components/fga/unauthorized";
import { getHistoryFromStore } from "@/llm/actions/history";
import { getUser, withFGA } from "@/sdk/fga";
import { assignChatReader, isChatUser } from "@/sdk/fga/chats";
import { withCheckPermission } from "@/sdk/fga/next/with-check-permission";
import { redirect } from "next/navigation";

type RootChatParams = Readonly<{
  children: React.ReactNode;
  params: {
    id: string;
  };
}>;

async function RootLayout({ children, params }: RootChatParams) {
  const conversation = await getHistoryFromStore(params.id);
  const { messages, ownerID } = conversation;
  const user = await getUser();

  return (
    <ChatProvider chatId={params.id}>
      <Header>
        <ShareConversation user={user} chatId={params.id} />
      </Header>

      <AI initialAIState={messages} conversationID={params.id}>
        {children}
      </AI>
    </ChatProvider>
  );
}

const fga = { assignChatReader: (a: string) => {} };
const invitationsDb = {
  isUserInvited: async (a: string) => {
    return Promise<true>;
  },
};

export default withCheckPermission(
  {
    checker: async ({ params }: RootChatParams) =>
      withFGA({
        object: `chat:${params.id}`,
        relation: "can_view",
      }),
    onUnauthorized: async ({ params }: RootChatParams) => {
      const chatId = params.id;

      if (await isChatUser(chatId)) {
        await assignChatReader(chatId);
        return redirect(`/chat/${chatId}`);
      }

      return (
        <ChatProvider chatId={chatId}>
          <Header />
          <UnauthorizedError>The conversation does not exist or you are not authorized to access it.</UnauthorizedError>
        </ChatProvider>
      );
    },
  },
  RootLayout
);
