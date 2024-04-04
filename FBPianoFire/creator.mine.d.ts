declare module md {
}

declare namespace ns {
}

declare var v:number|string;

declare const c:number;

declare function require(name:string):any;

declare class MyClass {
    _super:any;
}

declare namespace module {
    export module exports {
    }
}

declare namespace FBInstant {
    export module shareAsync {

    }
    export module getLeaderboardAsync {

    }
    export module getSupportedAPIs {

    }
    export module getRewardedVideoAsync {
        export function showAsync();
    }
    export module getInterstitialAdAsync {
        export function showAsync();
    }
    export module chooseAsync {

    }
    export module player {
        export function setStatsAsync();
        export function getStatsAsync();
        export function getDataAsync();
        export function setDataAsync();
        export function getPhoto();
        export function getPlayer();
        export function getScore();
        export function getPhoto();
        export function getName();
        export function getConnectedPlayersAsync();
    }

    export module getEntryPointData {

    }
    export module canCreateShortcutAsync {

    }
    export module createShortcutAsync {

    }
}

declare namespace wx {
    export module shareAppMessage {

    }
}

declare class visibleRect {
    /** Top left coordinate of the screen related to the game scene. */
    topLeft: any;
    /** Top right coordinate of the screen related to the game scene. */
    topRight: any;
    /** Top center coordinate of the screen related to the game scene. */
    top: any;
    /** Bottom left coordinate of the screen related to the game scene. */
    bottomLeft: any;
    /** Bottom right coordinate of the screen related to the game scene. */
    bottomRight: any;
    /** Bottom center coordinate of the screen related to the game scene. */
    bottom: any;
    /** Center coordinate of the screen related to the game scene. */
    center: any;
    /** Left center coordinate of the screen related to the game scene. */
    left: any;
    /** Right center coordinate of the screen related to the game scene. */
    right: any;
    /** Width of the screen. */
    width: number;
    /** Height of the screen. */
    height: number;
}

declare class batchData {
    sprites:any;
    array:any
}

