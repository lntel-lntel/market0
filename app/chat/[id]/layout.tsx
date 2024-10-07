import { AI } from "@/app/actions";
import { getHistory } from "@/llm/actions/history";
import { withFGA } from "@/sdk/fga";
import { withCheckPermission } from "@/sdk/fga/next/with-check-permission";
import { UserProvider } from "@auth0/nextjs-auth0/client";

type RootChatParams = Readonly<{
  children: React.ReactNode;
  params: {
    id: string;
  };
}>;

async function RootLayout({ children, params }: RootChatParams) {
  const messages = await getHistory(params.id);
  return (
    <AI initialAIState={messages} conversationID={params.id}>
      <UserProvider>{children}</UserProvider>
    </AI>
  );
}

export default withCheckPermission(
  {
    checker: ({ params }: RootChatParams) =>
      withFGA({
        object: `chat:${params.id}`,
        relation: "can_view",
      }),
    onUnauthorized: () => {
      return (
        // TODO: improve UI for this error message
        <main
          className="flex overflow-hidden h-full  mx-auto pt-4"
          style={{ maxHeight: "calc(100vh - 56px)" }}
        >
          <div className="h-full w-full overflow-hidden rounded-md">
            <div className="flex flex-col flex-no-wrap h-full overflow-y-auto overscroll-y-none">
              <div className="flex flex-col max-w-4xl mx-auto w-full mb-5">
                The conversation does not exist or you are not authorized to
                access it.
              </div>
            </div>
          </div>
        </main>
      );
    },
  },
  RootLayout
);
