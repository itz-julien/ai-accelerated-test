"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthForm } from "./auth-form";
import { Sidebar } from "./sidebar";
import { ChatPanel } from "./chat-panel";
import { SupervisorPanel } from "./supervisor-panel";
import { ModelBar } from "./model-bar";
import { createClient } from "@/lib/supabase/client";
import { type ModelId } from "@/lib/models";

export function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [supervisorMode, setSupervisorMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId>("gpt-4o");
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const handleChatCreated = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setSidebarRefreshKey((k) => k + 1);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-sm animate-pulse">
          Initializing systems...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm onAuth={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar
        onLogout={handleLogout}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setSupervisorMode(false);
        }}
        refreshKey={sidebarRefreshKey}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top status bar */}
        <div className="h-8 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 text-[10px] font-mono text-zinc-600">
          <span className="text-emerald-400 mr-2">●</span>
          SYSTEM ONLINE
          <span className="mx-3">|</span>
          LATENCY: &lt;100ms
          <span className="mx-3">|</span>
          MODELS: 3/3 CONNECTED
          <span className="mx-3">|</span>
          MSG LIMIT: 10
          <span className="mx-3">|</span>
          MODE: {supervisorMode ? "SUPERVISOR" : "SINGLE"}
          <span className="ml-auto">AI COMMAND CENTER v1.0</span>
        </div>

        {/* Model bar */}
        <ModelBar
          selectedModel={selectedModel}
          onSelectModel={(m) => {
            setSelectedModel(m);
            setSupervisorMode(false);
          }}
          supervisorMode={supervisorMode}
          onToggleSupervisor={() => {
            setSupervisorMode(!supervisorMode);
            if (!supervisorMode) setActiveChatId(null);
          }}
        />

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {supervisorMode ? (
            <SupervisorPanel />
          ) : (
            <ChatPanel
              activeChatId={activeChatId}
              onChatCreated={handleChatCreated}
              selectedModel={selectedModel}
            />
          )}
        </div>
      </div>
    </div>
  );
}
