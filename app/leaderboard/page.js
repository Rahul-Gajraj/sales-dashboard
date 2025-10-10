"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Crown, Trophy, Award, Search, RefreshCw } from "lucide-react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import useGetUsers from "../hooks/useGetUsers";
import { setUsers } from "../store/dashboard/UsersSlice";

const LEVEL_COLORS = {
  Rookie: "bg-gray-100 text-gray-800",
  Hunter: "bg-blue-100 text-blue-800",
  Striker: "bg-purple-100 text-purple-800",
  Slayer: "bg-yellow-100 text-yellow-800",
};

const LEVEL_ICONS = {
  Rookie: Award,
  Hunter: Trophy,
  Striker: Crown,
  Slayer: Crown,
};

export default function LeaderboardPage() {
  const users = useSelector((state) => state.users);

  const { data: session, status } = useSession();

  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const { usersData, isLoading } = useGetUsers(users, session);

  const match = users.find(
    (r) => r?.email?.toLowerCase().trim() === session?.user?.email
  );

  const { data: userInfo, isLoading: isUserDetailLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch(
        `/api/user?rep=${encodeURIComponent(match.rep)}`
      );
      if (!response.ok) throw new Error("Failed to fetch user details");
      return response.json();
    },
    enabled: !!session,
    staleTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    if (usersData) {
      dispatch(setUsers(usersData));
    }
  }, [usersData]);

  useEffect(() => {
    if (userInfo) {
      setLeaderboard(userInfo[0] || {});
    }
  }, [userInfo]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredLeaderboard = Array.isArray(leaderboard)
    ? leaderboard?.filter((rep) =>
        rep.rep_name.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    : [];

  if (status === "loading" || isLoading || isUserDetailLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center p-4">
  //       <Card className="w-full max-w-md">
  //         <CardContent className="pt-6 text-center">
  //           <p className="text-red-600 mb-4">Failed to load leaderboard</p>
  //           <button
  //             onClick={() => refetch()}
  //             className="text-blue-600 hover:underline"
  //           >
  //             Try again
  //           </button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{leaderboard?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Reps</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">2025Q3</p>
              <p className="text-sm text-gray-600">Current Cycle</p>
            </CardContent>
          </Card>
        </div>

        {/* Top 3 Podium */}
        {filteredLeaderboard.length > 0 && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-center text-yellow-800">
                🏆 Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-end gap-4">
                {filteredLeaderboard.slice(0, 3).map((rep, index) => {
                  const IconComponent = LEVEL_ICONS[rep.level] || Award;
                  const positions = [1, 0, 2]; // Reorder: 2nd, 1st, 3rd
                  const actualPosition = positions[index];

                  return (
                    <div
                      key={rep.rep_name}
                      className={`text-center space-y-2 ${
                        actualPosition === 0
                          ? "order-2 px-2"
                          : actualPosition === 1
                          ? "order-1 px-1"
                          : "order-3 px-1"
                      }`}
                    >
                      <div className="relative">
                        <Avatar
                          className={`mx-auto ${
                            actualPosition === 0 ? "w-20 h-20" : "w-14 h-14"
                          }`}
                        >
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                            {rep.rep_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {actualPosition === 0 && (
                          <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Crown className="w-4 h-4 text-yellow-800" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 min-h-[80px] flex flex-col justify-between">
                        <div>
                          <p
                            className={`font-semibold leading-tight ${
                              actualPosition === 0 ? "text-base" : "text-sm"
                            }`}
                            title={rep.rep_name}
                          >
                            {rep.rep_name.length > 12
                              ? rep.rep_name.substring(0, 10) + "..."
                              : rep.rep_name}
                          </p>
                          <p
                            className={`font-bold text-blue-600 ${
                              actualPosition === 0 ? "text-xl" : "text-lg"
                            }`}
                          >
                            {rep.points_total.toLocaleString()}
                          </p>
                        </div>

                        <Badge
                          variant="secondary"
                          className={`${
                            LEVEL_COLORS[rep.level]
                          } text-xs mx-auto`}
                        >
                          <IconComponent className="w-3 h-3 mr-1" />
                          {rep.level}
                        </Badge>
                      </div>

                      {/* Podium height indicator */}
                      <div
                        className={`bg-gradient-to-t rounded-t-lg mx-auto ${
                          actualPosition === 0
                            ? "from-yellow-400 to-yellow-500 h-12 w-16"
                            : actualPosition === 1
                            ? "from-gray-300 to-gray-400 h-8 w-14"
                            : "from-orange-300 to-orange-400 h-6 w-12"
                        }`}
                      >
                        <div className="text-white font-bold text-lg pt-2">
                          {actualPosition + 1}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>All Rankings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredLeaderboard.map((rep, index) => {
                const IconComponent = LEVEL_ICONS[rep.level] || Award;
                const isCurrentUser = rep.rep_name
                  .toLowerCase()
                  .includes(session?.user?.name?.toLowerCase() || "");

                return (
                  <div
                    key={rep.rep_name}
                    className={`flex items-center p-4 border-b last:border-b-0 hover:bg-gray-50 ${
                      isCurrentUser ? "bg-blue-50 border-blue-200" : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center">
                      <span
                        className={`font-bold ${
                          index < 3 ? "text-yellow-600" : "text-gray-600"
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center flex-1 ml-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback
                          className={`${
                            isCurrentUser
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-700"
                          } font-semibold`}
                        >
                          {rep.rep_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1">
                        <p
                          className={`font-semibold ${
                            isCurrentUser ? "text-blue-900" : "text-gray-900"
                          }`}
                        >
                          {rep.rep_name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-blue-600">
                              (You)
                            </span>
                          )}
                        </p>
                        <Badge
                          variant="outline"
                          className={`${
                            LEVEL_COLORS[rep.level]
                          } border-0 text-xs mt-1`}
                        >
                          <IconComponent className="w-3 h-3 mr-1" />
                          {rep.level}
                        </Badge>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p className="font-bold text-lg text-blue-600">
                        {rep.points_total.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredLeaderboard.length === 0 && searchQuery && (
              <div className="text-center py-8 text-gray-500">
                <p>No reps found matching "{searchQuery}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Navigation activeTab="leaderboard" />
    </div>
  );
}
