// Views/LoadingView.swift
// A reusable loading view component with F1 logo and customizable message

import SwiftUI

struct LoadingView: View {
    // Customizable loading message
    let message: String
    
    // Optional scale factor for the logo
    var logoScale: CGFloat = 1.0
    
    // Animation state for shimmer effect
    @State private var shimmerOffset: CGFloat = -0.25
    
    init(message: String = "Loading data...", logoScale: CGFloat = 1.0) {
        self.message = message
        self.logoScale = logoScale
    }
    
    var body: some View {
        VStack(spacing: 20) {
            // F1 Logo with shimmer effect overlay
            ZStack {
                // Base logo (static)
                Image("f1logo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 150 * logoScale, height: 70 * logoScale)
                
                // Shimmer effect
                ShimmerEffect()
                    .frame(width: 150 * logoScale, height: 70 * logoScale)
                    .mask(
                        Image("f1logo")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                    )
            }
            
            // Custom loading message
            Text(message)
                .font(FontManager.headline())
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(red: 0.97, green: 0.97, blue: 0.97))
        // Use clean background - no animations needed on the container
        // Shimmer effect has its own animation
    }
}

// MARK: - Shimmer Effect Component
struct ShimmerEffect: View {
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
struct LoadingView_Previews: PreviewProvider {
    static var previews: some View {
        LoadingView(message: "Warming up engines...")
    }
}
