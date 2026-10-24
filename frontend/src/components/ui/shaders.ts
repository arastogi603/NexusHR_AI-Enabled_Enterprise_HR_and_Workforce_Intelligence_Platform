export const vertexShader = `
uniform float spiralAngle;
uniform float uRadius;
uniform float uPlaneAspect;
uniform float uTextureAspect;
uniform float uDeform;
uniform vec2 uMouseNDC;
uniform float uMouseStrength;
varying vec2 vUv;
varying vec2 vUvCorrected;
varying vec3 vPosition;
varying float vMouseInfluence;

void main() {
    vec3 pos = position;

    float radius = uRadius;
    float localBend = pos.x / max(radius, 0.1);
    float angle = spiralAngle + localBend;

    pos.x = radius * sin(angle);
    pos.z = radius * cos(angle);

    vUv = uv;

    // Cover mode: scale UVs to fill plane without distortion
    vec2 uv = vUv - 0.5;
    float planeAspect = uPlaneAspect;
    float texAspect = uTextureAspect;

    if(texAspect > planeAspect) {
        uv.x *= planeAspect / texAspect;
    } else {
        uv.y *= texAspect / planeAspect;
    }

    // Scroll deformation: wave in Z and Y driven by velocity
    pos.z += sin(position.y * 3.0 + 100.) * uDeform * 0.04;
    pos.y += sin(position.x * 3.0) * uDeform * 0.02;

    // Mouse distortion: project this vertex to NDC, measure distance to mouse
    vec4 proj = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vec2 ndcPos = proj.xy / proj.w;
    float mouseDist = length(ndcPos - uMouseNDC);
    float bulge = exp(-mouseDist * mouseDist * 5.0) * uMouseStrength;
    pos.z += bulge * 0.5;

    vMouseInfluence = bulge;
    vUvCorrected = clamp(uv + 0.5, 0.0, 1.0);

    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = `
uniform float distanceFromCenter;
uniform sampler2D texture1;
varying vec2 vUvCorrected;
uniform float opacity;
varying float vMouseInfluence;

void main() {
	// Zoom the texture slightly toward the UV center where the mouse bulge peaks
	vec2 centeredUV = vUvCorrected - 0.5;
	vec2 distortedUV = clamp(vUvCorrected + centeredUV * vMouseInfluence * 0.12, 0.0, 1.0);

	vec4 t = texture2D(texture1, distortedUV);

	float bw = (t.r + t.g + t.b) / 9.;
	vec3 tint = vec3(0.125, 0.129, 0.137); // #202123
	vec4 another = vec4(mix(tint, vec3(1.0), bw), 1.0);

	gl_FragColor = mix(another, t, distanceFromCenter);
	gl_FragColor.a = clamp(distanceFromCenter, 0.0, 1.) * opacity;
}
`;
