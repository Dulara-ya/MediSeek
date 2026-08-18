import React, { useState, useMemo } from "react";
import * as ReactRouterDOM from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { useAuth } from "../contexts/AuthContext";
import { APP_COLORS, UserCircleIcon } from "../constants";
import { useUserData } from "../contexts/UserDataContext";
import { HealthPrediction, ChatMessage, ChatSummary } from "../types";
import HealthProgressChart from "../components/HealthProgressChart";
import Spinner from "../components/Spinner";

type StoredHealthPrediction = HealthPrediction & { date: string };

// Renders one health-history row with expand/collapse details
const HealthHistoryItem: React.FC<{ item: StoredHealthPrediction }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getScoreColor = (s: number) => {
    // support both `healthScore` and `score` inputs
    const val = (item as any).healthScore ?? (item as any).score ?? s ?? 0;
    if (val < 40) return "text-red-500";
    if (val < 70) return "text-yellow-500";
    return "text-green-500";
  };

  // normalize fields (support either `healthScore` or `score`)
  const score = (item as any).healthScore ?? (item as any).score ?? 0;
  const potentialDiseases: string[] = Array.isArray((item as any).potentialDiseases)
    ? (item as any).potentialDiseases
    : [];
  const preventionTips: string[] = Array.isArray((item as any).preventionTips)
    ? (item as any).preventionTips
    : [];

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 focus:outline-none"
      >
        <div>
          <p className="font-semibold">{new Date(item.date).toLocaleDateString()}</p>
          <p className="text-sm text-gray-500">Click to view details</p>
        </div>
        <div className="flex items-center">
          <span className={`text-2xl font-bold mr-4 ${getScoreColor(score)}`}>{score}</span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-gray-50">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-1">Potential Diseases:</h4>
            {potentialDiseases.length ? (
              <ul className="list-disc list-inside text-sm text-gray-600">
                {potentialDiseases.map((disease, i) => (
                  <li key={i}>{disease}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No items</p>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Prevention Tips:</h4>
            {preventionTips.length ? (
              <ul className="list-disc list-inside text-sm text-gray-600">
                {preventionTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No items</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// A day-group component for chat (renders empty state until chat storage is wired)
const ChatHistoryDay: React.FC<{
  date: string;
  messages: ChatMessage[];
  summary: ChatSummary | undefined;
  onSummarize: (date: string) => void;
  isSummarizing: boolean;
}> = ({ date, messages, summary, onSummarize, isSummarizing }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 focus:outline-none"
      >
        <div>
          <p className="font-semibold">
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-sm text-gray-500">{messages.length} messages</p>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 bg-gray-50">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Daily Summary</h4>
            {summary ? (
              <p className="text-sm text-gray-600 italic bg-yellow-50 p-2 rounded">{summary.summary}</p>
            ) : (
              <button
                onClick={() => onSummarize(date)}
                disabled={isSummarizing}
                style={{ backgroundColor: APP_COLORS.accent }}
                className="w-full text-white font-semibold py-2 px-4 rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
              >
                {isSummarizing ? <Spinner size="sm" color="text-white" /> : "Generate Summary with AI"}
              </button>
            )}
          </div>

          <h4 className="font-semibold text-gray-700 mb-2 mt-4">Conversation</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-lg max-w-[80%] text-sm ${
                  msg.sender === "user" ? "bg-calm-blue-secondary ml-auto text-right" : "bg-gray-100"
                }`}
              >
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();

  // Use data from UserDataContext (this context ONLY exposes history/loading/error)
  const { history, loading, error } = useUserData();

  // Map context history -> UI-friendly format
  const healthHistory: StoredHealthPrediction[] = useMemo(() => {
    const arr = Array.isArray(history) ? history : [];
    return arr
      .map((h: any) => {
        // normalize date
        const dateVal = h?.date || h?.createdAt || new Date().toISOString();
        const date =
          typeof dateVal === "string"
            ? dateVal
            : dateVal instanceof Date
            ? dateVal.toISOString()
            : new Date(dateVal).toISOString();

        // normalize score field
        const score = typeof h?.healthScore === "number" ? h.healthScore : typeof h?.score === "number" ? h.score : 0;

        return {
          // keep everything that HealthPrediction normally has; fallbacks for arrays
          healthScore: score,
          potentialDiseases: Array.isArray(h?.potentialDiseases) ? h.potentialDiseases : [],
          preventionTips: Array.isArray(h?.preventionTips) ? h.preventionTips : [],
          // plus the date required by this page
          date,
        } as StoredHealthPrediction;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  // Chat is not stored via UserDataContext in your current codebase.
  // Keep empty structures, UI will show "No chat history" gracefully.
  const chatHistoryByDate: Record<string, ChatMessage[]> = {};
  const chatSummaries: ChatSummary[] = [];
  const [summarizingDate, setSummarizingDate] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  const handleGenerateSummary = async (date: string) => {
    // Placeholder until chat storage + summary service is wired
    setSummarizingDate(date);
    // TODO: call your summarize service and persist its result
    setTimeout(() => setSummarizingDate(null), 800);
  };

  if (!user) {
    return null; // protected route should prevent this
  }

  const sortedChatDates = Object.keys(chatHistoryByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <PageWrapper title="My Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* User Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col items-center mb-6">
            <UserCircleIcon className="w-24 h-24 text-calm-blue-primary" />
            <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold text-gray-700">Full Name:</span>
              <span className="text-gray-800">{user.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="text-gray-800">{user.email}</span>
            </div>
            {user.birthDate && (
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold text-gray-700">Birth Date:</span>
                <span className="text-gray-800">{user.birthDate}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            style={{ backgroundColor: APP_COLORS.red }}
            className="w-full mt-8 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline hover:opacity-90 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Health Score History Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-calm-blue-accent mb-4">Health Progress</h3>

          {loading ? (
            <div className="py-8 flex justify-center">
              <Spinner />
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <>
              <HealthProgressChart history={healthHistory} />

              <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Detailed History</h4>
              {healthHistory.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  {healthHistory.map((item) => (
                    <HealthHistoryItem key={item.date} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No health score predictions found. Go to the &quot;Health&quot; tab to calculate your first score!
                </p>
              )}
            </>
          )}
        </div>

        {/* Chat History Card (placeholder until wired) */}
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
  <h3 className="text-xl font-bold text-calm-blue-accent text-center mb-4">
    MediSeek — Your Health, Our Nation’s Care 🇱🇰
  </h3>
          {sortedChatDates.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              {sortedChatDates.map((date) => (
                <ChatHistoryDay
                  key={date}
                  date={date}
                  messages={chatHistoryByDate[date]}
                  summary={chatSummaries.find((s) => s.date === date)}
                  onSummarize={handleGenerateSummary}
                  isSummarizing={summarizingDate === date}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Powered by the passion of ICBT Campus Software Engineering students
            </p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProfilePage;
