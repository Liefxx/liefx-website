// src/app/api/twitch/route.ts

import { NextResponse, NextRequest } from 'next/server';
import {
    getAppAccessToken,
    getUserAccessToken,
    validateAccessToken,
    fetchTwitchData,
    revokeUserAccessToken,
    fetchUserInfoWithToken,
    fetchUser,
    fetchSchedule,
    fetchPastBroadcasts
} from '@/lib/twitch';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        // Get parameters from request
        const { searchParams } = new URL(request.url)

        // Get the app access token
        const appAccessToken = await getAppAccessToken();
        if (!appAccessToken) {
            console.error("Failed to get app access token");
            return NextResponse.json({ error: 'Failed to get app access token' }, { status: 500 });
        }

        const userLogin = process.env.NEXT_PUBLIC_TWITCH_USER_LOGIN;
        if (!userLogin) {
            console.error("Twitch user login not configured");
            return NextResponse.json({ error: 'Twitch user login not configured' }, { status: 500 }); //Internal Server Error
        }

        // Get user access token, if available
        const userAccessToken = await getUserAccessToken();

        if (userAccessToken) {
            // Fetch User Info (requires user access token)
            const userInfo = await fetchUserInfoWithToken(userAccessToken, process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!);

            if (userInfo && userInfo.data && userInfo.data.length > 0) {

                // Fetch Schedule (requires user access token)
                const userSchedule = await fetchSchedule(userInfo.data[0].id, appAccessToken, process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!)


                const scheduleData = userSchedule.data.segments ? userSchedule.data.segments.map((item: any) => {
                    return {
                        id: item.id,
                        start_time: item.start_time,
                        end_time: item.end_time,
                        title: item.title,
                        canceled_until: item.canceled_until,
                        category: item.category ? {
                            id: item.category.id,
                            name: item.category.name
                        } : null,
                    };
                }) : [];

                const combinedData = {
                    userInfo: {
                        id: userInfo.data[0].id,
                        login: userInfo.data[0].login,
                        display_name: userInfo.data[0].display_name,
                        profile_image_url: userInfo.data[0].profile_image_url,
                        description: userInfo.data[0].description,
                    },
                    schedule: {
                        vacation: userSchedule.data.vacation,
                        segments: scheduleData
                    },
                };

                // Respond with combined user info and schedule
                return NextResponse.json(combinedData);

            } else {
                // If no user info, fall back to app access token data (offline status)
                const twitchData = await fetchTwitchData(userLogin, appAccessToken);

                if (!twitchData) {
                    console.error("Failed to fetch Twitch data");
                    return NextResponse.json({ error: 'Failed to fetch Twitch data' }, { status: 500 });
                }

                // Fetch User Info (requires user id)
                const user = await fetchUser(userLogin, appAccessToken); // Corrected function name

                if (!user) {
                    console.error("Failed to fetch user");
                    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
                }


                //fetch Past Broadcasts
                const pastBroadcasts = await fetchPastBroadcasts(user.data[0].id, appAccessToken)


                // Check if schedule exists
                const scheduleData = twitchData.schedule?.segments ? twitchData.schedule.segments.map((item: any) => {
                    return {
                        id: item.id,
                        start_time: item.start_time,
                        end_time: item.end_time,
                        title: item.title,
                        canceled_until: item.canceled_until,
                        category: item.category ? {
                            id: item.category.id,
                            name: item.category.name
                        } : null,
                    };
                }) : [];


                // Map past broadcasts
                const pastBroadcastsData = pastBroadcasts.data ? pastBroadcasts.data.map((item: any) => {
                    return {
                        id: item.id,
                        title: item.title,
                        created_at: item.created_at,
                        thumbnail_url: item.thumbnail_url
                    }
                }) : null;

                const combinedData = {
                    streamStatus: {
                        isLive: twitchData.isLive,
                        title: twitchData.title,
                        game: twitchData.game,
                        viewerCount: twitchData.viewerCount,
                    },
                    userInfo: {
                        id: user.data[0].id,
                        login: user.data[0].login,
                        display_name: user.data[0].display_name,
                        profile_image_url: user.data[0].profile_image_url,
                        description: user.data[0].description
                    },
                    schedule: {
                        vacation: twitchData.schedule?.vacation,
                        segments: scheduleData,
                    },
                    pastBroadcasts: pastBroadcastsData
                };

                return NextResponse.json(combinedData); // Return the fetched data
            }
        } else {
            // No user access token, fall back to app access token data (offline status)
            const appAccessToken = await getAppAccessToken();
            if (!appAccessToken) {
                return NextResponse.json({ error: 'Failed to get app access token' }, { status: 500 });
            }

            const twitchData = await fetchTwitchData(userLogin, appAccessToken);
            if (!twitchData) {
                return NextResponse.json({ error: 'Failed to fetch Twitch data' }, { status: 500 });
            }

            // Fetch User Info (requires user id)
            const user = await fetchUser(userLogin, appAccessToken); // Corrected function name

            if (!user) {
                return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
            }


            //fetch Past Broadcasts
            const pastBroadcasts = await fetchPastBroadcasts(user.data[0].id, appAccessToken)


            // Check if schedule exists
            const scheduleData = twitchData.schedule?.segments ? twitchData.schedule.segments.map((item: any) => {
                return {
                    id: item.id,
                    start_time: item.start_time,
                    end_time: item.end_time,
                    title: item.title,
                    canceled_until: item.canceled_until,
                    category: item.category ? {
                        id: item.category.id,
                        name: item.category.name
                    } : null,
                };
            }) : [];


            // Map past broadcasts
            const pastBroadcastsData = pastBroadcasts.data ? pastBroadcasts.data.map((item: any) => {
                return {
                    id: item.id,
                    title: item.title,
                    created_at: item.created_at,
                    thumbnail_url: item.thumbnail_url
                }
            }) : null;

            const combinedData = {
                streamStatus: {
                    isLive: twitchData.isLive,
                    title: twitchData.title,
                    game: twitchData.game,
                    viewerCount: twitchData.viewerCount,
                },
                userInfo: {
                    id: user.data[0].id,
                    login: user.data[0].login,
                    display_name: user.data[0].display_name,
                    profile_image_url: user.data[0].profile_image_url,
                    description: user.data[0].description
                },
                schedule: {
                    vacation: twitchData.schedule?.vacation,
                    segments: scheduleData,
                },
                pastBroadcasts: pastBroadcastsData
            };

            return NextResponse.json(combinedData);
        }

    } catch (error) {
        console.error("Error in /api/twitch GET:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      // Get the user's Twitch access token.  This assumes `getUserAccessToken`
      // is correctly implemented to retrieve the token based on the session.
      const userAccessToken = await getUserAccessToken();
      if (!userAccessToken) {
        return NextResponse.json({ error: 'User access token not found' }, { status: 404 });
      }
  
      // Revoke the token with the Twitch API.
      const revokeResult = await revokeUserAccessToken(userAccessToken);
      if (!revokeResult) {
        return NextResponse.json({ error: 'Failed to revoke token with Twitch' }, { status: 500 });
      }
  
      // Delete token in database
      await prisma.account.deleteMany({
        where: {
            userId: session.user.id
        }
    });
  
      return NextResponse.json({ message: 'Access token revoked and account deleted' });
  
    } catch (error) {
      console.error("Error in /api/twitch DELETE:", error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }