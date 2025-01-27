import {
    createContext,
    useEffect,
    useState,
    useReducer,
    useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import { ws } from "../ws";
import { peersReducer, PeerState } from "../reducers/peerReducer";
import {
    addPeerStreamAction,
    addPeerNameAction,
    removePeerStreamAction,
    addAllPeersAction,
} from "../reducers/peerActions";

import { UserContext } from "./UserContext";
import { IPeer } from "../types/peer";

interface RoomValue {
    stream?: MediaStream;
    screenStream?: MediaStream;
    peers: PeerState;
    shareScreen: () => void;
    roomId: string;
    setRoomId: (id: string) => void;
    screenSharingId: string;
}

export const RoomContext = createContext<RoomValue>({
    peers: {},
    shareScreen: () => {},
    setRoomId: (id) => {},
    screenSharingId: "",
    roomId: "",
});

if (!!window.Cypress) {
    window.Peer = Peer;
}

export const RoomProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { userName, userId } = useContext(UserContext);
    const [me, setMe] = useState<Peer>();
    const [stream, setStream] = useState<MediaStream>();
    const [screenStream, setScreenStream] = useState<MediaStream>();
    const [peers, dispatch] = useReducer(peersReducer, {});
    const [screenSharingId, setScreenSharingId] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const [connections, setConnections] = useState<{ [key: string]: any[] }>({});

    const enterRoom = ({ roomId }: { roomId: "string" }) => {
        navigate(`/room/${roomId}`);
    };
    const getUsers = ({
        participants,
    }: {
        participants: Record<string, IPeer>;
    }) => {
        dispatch(addAllPeersAction(participants));
    };

    const removePeer = (peerId: string) => {
        dispatch(removePeerStreamAction(peerId));
    };


    const switchStream = (stream: MediaStream) => {
        setScreenSharingId(me?.id || "");
        // Object.values(me.connections).forEach((connection: any) => {

        //     const videoTrack: any = stream
        //         ?.getTracks()
        //         .find((track) => track.kind === "video");
        //     connection[0].peerConnection
        //         .getSenders()
        //         .find((sender: any) => sender.track.kind === "video")
        //         .replaceTrack(videoTrack)
        //         .catch((err: any) => console.error(err));
        // });
        if (!connections || Object.keys(connections).length === 0) {
            console.warn("No active connections found");
            return;
        }
    
        const videoTrack = stream.getTracks().find((track) => track.kind === "video");
        if (!videoTrack) {
            console.error("No video track found in the stream");
            return;
        }

        Object.values(connections).forEach((connectionArray) => {
            connectionArray.forEach((connection) => {
                const sender = connection.peerConnection
                    .getSenders()
                    .find((sender) => sender.track?.kind === "video");
                if (sender) {
                    sender.replaceTrack(videoTrack).catch((err) => console.error("Failed to replace track:", err));
                }
            });
        });
    };

    useEffect(() => {
        if (!me) return;
    
        me.on("connection", (conn) => {
            setConnections((prev) => ({
                ...prev,
                [conn.peer]: [...(prev[conn.peer] || []), conn],
            }));
        });
    }, [me]);

    const shareScreen = () => {
        if (screenSharingId) {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then(switchStream);
        } else {
            navigator.mediaDevices.getDisplayMedia({}).then((stream) => {
                switchStream(stream);
                setScreenStream(stream);
            });
        }
    };

    const nameChangedHandler = ({
        peerId,
        userName,
    }: {
        peerId: string;
        userName: string;
    }) => {
        dispatch(addPeerNameAction(peerId, userName));
    };

    useEffect(() => {
        ws.emit("change-name", { peerId: userId, userName, roomId });
    }, [userName, userId, roomId]);

    useEffect(() => {
        const peer = new Peer(userId, {
            host: "localhost",
            port: 9001,
            path: "/",
            debug: 3,
        });
        peer.on("open", (id) => {
            console.log("Peer connected with ID:", id);
            setMe(peer);
        });
    
        peer.on("error", (err) => {
            console.error("Peer error:", err);
        });

        try {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    setStream(stream);
                });
        } catch (error) {
            console.error(error);
        }

        ws.on("room-created", enterRoom);
        ws.on("get-users", getUsers);
        ws.on("user-disconnected", removePeer);
        ws.on("user-started-sharing", (peerId) => setScreenSharingId(peerId));
        ws.on("user-stopped-sharing", () => setScreenSharingId(""));
        ws.on("name-changed", nameChangedHandler);

        return () => {
            ws.off("room-created");
            ws.off("get-users");
            ws.off("user-disconnected");
            ws.off("user-started-sharing");
            ws.off("user-stopped-sharing");
            ws.off("user-joined");
            ws.off("name-changed");
            me?.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (screenSharingId) {
            ws.emit("start-sharing", { peerId: screenSharingId, roomId });
        } else {
            ws.emit("stop-sharing");
        }
    }, [screenSharingId, roomId]);
    
    if (!ws) {
        console.error("WebSocket instance is undefined");
    }
    
    useEffect(() => {
        if (!me) return;
        if (!stream) return;
        ws.on("user-joined", ({ peerId, userName: name }) => {
            if (!me || !me.open) {
                console.error("Peer instance is not ready");
                return;
            }
            if (!peerId) {
                console.error("Invalid peerId");
                return;
            }
            if (!stream) {
                console.error("MediaStream is not available");
                return;
            }
        
            const call = me.call(peerId, stream, {
                metadata: { userName },
            });
        
            if (!call) {
                console.error("Failed to initiate call");
                return;
            }

            if (call.open) {
                console.warn(`Call already open with peer ${call.peer}`);
                return;
            }
        
            // call.answer(stream);
        
            call.on("stream", (peerStream) => {
                console.log("Received peer stream from:", peerId);
                dispatch(addPeerStreamAction(peerId, peerStream));
            });
        
            dispatch(addPeerNameAction(peerId, name));
        });
        

        me.on("call", (call) => {
            const { userName } = call.metadata;
            dispatch(addPeerNameAction(call.peer, userName));
            call.answer(stream);
            call.on("stream", (peerStream) => {
                dispatch(addPeerStreamAction(call.peer, peerStream));
            });
        });

        return () => {
            ws.off("user-joined");
        };
    }, [me, stream, userName]);

    return (
        <RoomContext.Provider
            value={{
                stream,
                screenStream,
                peers,
                shareScreen,
                roomId,
                setRoomId,
                screenSharingId,
            }}
        >
            {children}
        </RoomContext.Provider>
    );
};
