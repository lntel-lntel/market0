"use client";

import {} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { ChatUser } from "@/lib/db/chat-users";
import { cn } from "@/lib/utils";
import { removeChatUser } from "@/sdk/fga/chats";
import { CheckIcon, ChevronDownIcon, TrashIcon } from "@radix-ui/react-icons";

export interface UserPermissionActionsProps {
  user: ChatUser;
}

export function UserPermissionActions({ user }: UserPermissionActionsProps) {
  const { id } = user;
  const role = user.access === "can_view" ? "viewer" : "owner";

  async function handleOnRemove() {
    try {
      await removeChatUser(id);
    } catch (err) {
      toast({
        title: "Error!",
        description: (err as Error).message || "There was a problem removing access to this chat. Try again later.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      {role === "owner" && (
        <Button variant="ghost" className="font-normal pointer-events-none">
          <span className="text-gray-600 text-sm">{role}</span>
        </Button>
      )}
      {role === "viewer" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="font-normal flex gap-2">
              <span className="text-gray-600 text-sm">{role}</span>
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="text-sm" align="end" sideOffset={8}>
            <DropdownMenuItem>
              <button className="flex justify-start text-gray-600 items-center gap-1 font-normal text-sm">
                <CheckIcon /> viewer
              </button>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <button
                className={cn("flex justify-start items-center gap-1 font-normal text-sm", {
                  "ps-5 disabled text-gray-400 cursor-not-allowed": true,
                })}
              >
                editor
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <button
                className="flex justify-start items-center gap-1 font-normal text-sm text-destructive"
                onClick={handleOnRemove}
              >
                <TrashIcon />
                Remove access
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}