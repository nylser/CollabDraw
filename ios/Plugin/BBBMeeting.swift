import Foundation
import WebKit
import Capacitor
import SwiftUI

@objc public class BBBMeeting: NSObject {
    @objc public func echo(_ value: String) -> String {
        return value
    }
    
    public func showWebView(_ url: String, _ bridge: CAPBridgeProtocol) -> Void {
        var child = UIHostingController(rootView: ContentView())
        DispatchQueue.main.async {
            bridge.presentVC(child, animated: false, completion: nil)
        }
        
    }
}
