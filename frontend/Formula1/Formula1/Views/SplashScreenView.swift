// Views/SplashScreenView.swift
// A dedicated splash screen view with F1 logo and shimmer effect
// To be used as launch screen

import SwiftUI

struct SplashScreenView: View {
    // Animation state for shimmer effect
    @State private var startShimmer = false

    var body: some View {
        ZStack {
            // Background color - using the same as our app
            Color(red: 0.97, green: 0.97, blue: 0.97)
                .edgesIgnoringSafeArea(.all)

            // F1 Logo with shimmer effect overlay
            ZStack {
                // Base logo (static)
                Image("f1logo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 200, height: 100)

                // Shimmer effect
                if startShimmer {
                    SplashShimmerEffect()
                        .frame(width: 200, height: 100)
                        .mask(
                            Image("f1logo")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                        )
                }
            }
        }
        .onAppear {
            // Start shimmer with a slight delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                startShimmer = true
            }
        }
    }
}

// MARK: - Shimmer Effect Component for Splash Screen
struct SplashShimmerEffect: View {
    @State private var movingOffset: CGFloat = -1

    var body: some View {
        // Create gradient for shimmer effect
        LinearGradient(
            gradient: Gradient(
                stops: [
                    .init(color: Color.white.opacity(0.0), location: 0),
                    .init(color: Color.white.opacity(0.3), location: 0.3),
                    .init(color: Color.white.opacity(0.5), location: 0.5),
                    .init(color: Color.white.opacity(0.3), location: 0.7),
                    .init(color: Color.white.opacity(0.0), location: 1)
                ]
            ),
            startPoint: .leading,
            endPoint: .trailing
        )
        .rotationEffect(.degrees(70))  // Angle the shimmer slightly
        .offset(x: -100)  // Start offset outside view bounds
        .offset(x: movingOffset > 0 ? 500 : 0)  // Animation offset
        .onAppear {
            // Animate the shimmer continuously across the image
            withAnimation(Animation.linear(duration: 2.0).repeatForever(autoreverses: false)) {
                movingOffset = 1
            }
        }
        .blendMode(.screen)  // Use screen blend mode for better light effect
    }
}

// MARK: - Preview
struct SplashScreenView_Previews: PreviewProvider {
    static var previews: some View {
        SplashScreenView()
    }
}
