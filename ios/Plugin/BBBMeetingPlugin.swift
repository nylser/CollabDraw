import Foundation
import Capacitor
import SwiftUI

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(BBBMeetingPlugin)
public class BBBMeetingPlugin: CAPPlugin {
    private let implementation = BBBMeeting()
    var vc2: ViewController2?

    @objc func echo(_ call: CAPPluginCall) {
    
        
        DispatchQueue.main.async { [weak self] in
            let vc2 = ViewController()
            let vc = UIHostingController(rootView: ContentView())
            vc.modalPresentationStyle = .fullScreen
            self?.bridge?.presentVC(vc, animated: true, completion: {
                call.resolve()
            })
                
        }

        /*let value = call.getString("value") ?? ""
        call.resolve([
            "value": implementation.echo(value)
        ])*/
    }
    
    @objc func showView(_ call: CAPPluginCall) {
        guard let bridge = self.bridge else { return };
        implementation.showWebView("wow", bridge);
        call.resolve();
    }
}
