"""Blender (bpy 4.2) script: models stylised, monument-inspired landmarks for INDIA RUN and
exports them as glTF binaries.  Run:  blenv/bin/python tools/blender_monuments.py  OUTDIR

Every model is an original, simplified interpretation built from primitives + booleans.
Material names (marble, redstone, buffstone, ...) are swapped for the game's PBR materials at load time.
Blender is Z-up; the front of each monument faces -Y (becomes +Z in glTF)."""
import bpy, bmesh, math, sys, os
from mathutils import Vector

OUT = sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith('.py') else '/tmp/monuments'
os.makedirs(OUT, exist_ok=True)

COLORS = {
    'marble': (0.93, 0.92, 0.88), 'redstone': (0.62, 0.25, 0.16), 'buffstone': (0.78, 0.62, 0.45),
    'yellowstone': (0.80, 0.66, 0.44), 'limestone': (0.85, 0.79, 0.68), 'pink': (0.88, 0.52, 0.42),
    'white': (0.96, 0.95, 0.92), 'granite': (0.72, 0.69, 0.63), 'gold': (1.0, 0.76, 0.3), 'dark': (0.12, 0.1, 0.09),
}


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    c = COLORS[name]
    b.inputs['Base Color'].default_value = (c[0], c[1], c[2], 1)
    b.inputs['Roughness'].default_value = 0.3 if name in ('marble', 'gold') else 0.8
    b.inputs['Metallic'].default_value = 1.0 if name == 'gold' else 0.0
    return m


def finish(o, m):
    o.data.materials.clear()
    o.data.materials.append(mat(m))
    return o


def box(sx, sy, sz, x=0, y=0, z=0, m='marble'):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z + sz / 2))
    o = bpy.context.active_object
    o.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True)
    return finish(o, m)


def cyl(r, h, x=0, y=0, z=0, m='marble', v=16, r2=None, rot=None):
    bpy.ops.mesh.primitive_cone_add(vertices=v, radius1=r, radius2=r if r2 is None else r2, depth=h, location=(x, y, z + h / 2))
    o = bpy.context.active_object
    if rot:
        o.rotation_euler = rot
        bpy.ops.object.transform_apply(rotation=True)
    return finish(o, m)


def lathe(profile, x=0, y=0, z=0, m='marble', steps=20, name='lathe'):
    """profile: list of (radius, height) bottom->top; spun around Z"""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, h)) for r, h in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=steps, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.location = (x, y, z)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.transform_apply(location=False)
    return finish(o, m)


ONION = [(0, 0), (1, 0), (1.08, 0.25), (1.12, 0.5), (1.02, 0.8), (0.75, 1.1), (0.42, 1.38), (0.16, 1.62), (0.06, 1.85), (0.0, 1.95)]
HEMI = [(math.cos(a), math.sin(a)) for a in [i * math.pi / 2 / 8 for i in range(9)]]


def dome(r, x, y, z, m='marble', shape=ONION, finial=True):
    o = lathe([(p[0] * r, p[1] * r) for p in shape], x, y, z, m, 20, 'dome')
    if finial:
        cyl(0.06 * r + 0.05, 0.5 * r, x, y, z + shape[-1][1] * r, 'gold', 8, 0.01)
    return o


def arch_cutter(w, h, depth, x=0, y=0, z=0, pointed=True):
    """cutter for an arched opening: rectangle + (pointed) round top, through Y"""
    rect_h = h - w * (0.7 if pointed else 0.5)
    a = box(w, depth, rect_h, x, y, z, 'dark')
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=w / 2, depth=depth, location=(x, y, z + rect_h), rotation=(math.pi / 2, 0, 0))
    c = bpy.context.active_object
    if pointed:
        c.scale = (1, 1.4, 1)
        bpy.ops.object.transform_apply(scale=True)
    mod = a.modifiers.new('u', 'BOOLEAN'); mod.operation = 'UNION'; mod.object = c; mod.solver = 'EXACT'
    bpy.context.view_layer.objects.active = a
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(c, do_unlink=True)
    return a


def join(objs):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    return objs[0]


def cut(target, cutter):
    mod = target.modifiers.new('cut', 'BOOLEAN')
    mod.operation = 'DIFFERENCE'
    mod.object = cutter
    mod.solver = 'EXACT'
    mod.use_self = True
    mod.use_hole_tolerant = True
    bpy.context.view_layer.objects.active = target
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter, do_unlink=True)
    return target


def rotz(o, ang, origin=(0, 0, 0)):
    o.rotation_euler[2] += ang
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True)
    bpy.ops.object.transform_apply(rotation=True)


def chhatri(x, y, z, s=1, m='marble', dm=None):
    parts = [box(2 * s, 2 * s, 0.2 * s, x, y, z, m)]
    for dx in (-1, 1):
        for dy in (-1, 1):
            parts.append(box(0.18 * s, 0.18 * s, 1.3 * s, x + dx * 0.8 * s, y + dy * 0.8 * s, z + 0.2 * s, m))
    parts.append(box(2.2 * s, 2.2 * s, 0.2 * s, x, y, z + 1.5 * s, m))
    dome(0.9 * s, x, y, z + 1.7 * s, dm or m)


def minaret(x, y, z, h, r, m='marble', tiers=3, top=True, dm=None, v=12):
    cyl(r, h, x, y, z, m, v, r * 0.82)
    for i in range(1, tiers + 1):
        zz = z + h * i / (tiers + 1)
        cyl(r * 1.45, 0.35, x, y, zz, m, v)
    if top:
        chhatri(x, y, z + h, r * 0.9, m, dm)


def export(name):
    bpy.ops.object.select_all(action='SELECT')
    path = os.path.join(OUT, name + '.glb')
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_apply=True, export_yup=True, export_normals=True, export_texcoords=False, export_materials='EXPORT')
    tris = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
    print(f'{name}: {os.path.getsize(path)//1024} KB, {tris} faces')


# ---------------------------------------------------------------- 1. war-memorial arch (India Gate-inspired)
def war_arch():
    reset()
    box(32, 12, 1.2, m='buffstone')
    b = box(24, 7, 30, z=1.2, m='buffstone')
    b = cut(b, arch_cutter(10, 21, 9, z=1.2, pointed=False))
    for zz, w, d, h in [(22, 25, 7.8, 1.0), (26, 25, 7.8, 0.8), (31.2, 21, 6.4, 3.0), (34.2, 17, 5.6, 2.2)]:
        box(w, d, h, z=zz, m='redstone' if zz in (22, 26) else 'buffstone')
    dome(2.8, 0, 0, 36.4, 'buffstone', HEMI, finial=False)
    for dx in (-1, 1):
        box(1.2, 7.4, 20, dx * 6.2, 0, 1.2, 'redstone')
    export('war_arch')


# ---------------------------------------------------------------- 2. harbour arch (Gateway of India-inspired)
def harbour_arch():
    reset()
    box(40, 18, 1.2, m='yellowstone')
    c = box(16, 12, 22, z=1.2, m='yellowstone')
    c = cut(c, arch_cutter(8, 17, 14, z=1.2))
    for dx in (-1, 1):
        w = box(9, 10, 14, dx * 12.5, 0, 1.2, 'yellowstone')
        cut(w, arch_cutter(4.5, 10, 12, dx * 12.5, 0, 1.2))
        for dy in (-1, 1):
            minaret(dx * 8.6, dy * 6.2, 1.2, 26, 1.5, 'yellowstone', 3, True, 'yellowstone', 8)
        for i in range(3):
            box(1.0, 1.4, 1.4, dx * (10 + i * 2.6), -5.4, 15.2, 'white')
            dome(0.55, dx * (10 + i * 2.6), -5.4, 16.6, 'yellowstone', HEMI, False)
    box(17, 12.6, 1.2, z=23.2, m='white')
    for i in range(-3, 4):
        box(1.2, 1.2, 1.6, i * 2.2, -6.0, 24.4, 'yellowstone')
    export('harbour_arch')


# ---------------------------------------------------------------- 3. fluted victory tower (Qutub Minar-inspired)
def victory_tower():
    reset()
    box(12, 12, 1.0, m='redstone')
    z, r = 1.0, 4.4
    tiers = [(13, 'redstone'), (10, 'redstone'), (8, 'redstone'), (6.5, 'marble'), (5.5, 'marble')]
    for i, (h, m) in enumerate(tiers):
        bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=r, radius2=r * 0.86, depth=h, location=(0, 0, z + h / 2))
        o = bpy.context.active_object
        me = o.data
        for vtx in me.vertices:  # flutes: alternate radius
            ang = math.atan2(vtx.co.y, vtx.co.x)
            k = 1 + 0.07 * math.cos(ang * 12)
            vtx.co.x *= k; vtx.co.y *= k
        finish(o, m)
        z += h
        r *= 0.86
        cyl(r * 1.35, 0.5, 0, 0, z - 0.1, 'buffstone', 24)
        r *= 0.95
    cyl(r * 0.9, 2.0, 0, 0, z + 0.4, 'marble', 12)
    dome(r * 0.9, 0, 0, z + 2.4, 'marble', HEMI, True)
    export('victory_tower')


# ---------------------------------------------------------------- 4. four-minaret gate (Charminar-inspired)
def four_minaret_gate():
    reset()
    b = box(20, 20, 17, m='limestone')
    b = cut(b, arch_cutter(10.5, 14.5, 24, pointed=True))
    cutter = arch_cutter(10.5, 14.5, 24, pointed=True); rotz(cutter, math.pi / 2)
    b = cut(b, cutter)
    box(21, 21, 1.0, z=17, m='white')
    g = box(18, 18, 3.6, z=18, m='limestone')
    for k in range(-3, 4):
        box(1.6, 18.4, 2.2, k * 2.4, 0, 18.6, 'dark')
    box(19, 19, 0.8, z=21.6, m='white')
    for dx in (-1, 1):
        for dy in (-1, 1):
            minaret(dx * 9.6, dy * 9.6, 0, 46, 1.6, 'limestone', 4, True, 'limestone', 12)
    export('four_minaret_gate')


# ---------------------------------------------------------------- 5. marble memorial hall (Victoria Memorial-inspired)
def memorial_hall():
    reset()
    box(70, 34, 2, m='marble')
    box(60, 26, 13, z=2, m='marble')
    box(62, 28, 1.2, z=15, m='white')
    for dx in (-1, 1):
        box(12, 30, 15, dx * 30, 0, 2, 'marble')
        dome(3.2, dx * 30, 0, 17, 'marble', ONION, True)
    for i in range(-5, 6):
        cyl(0.55, 11, i * 2.4, -14, 2, 'white', 10)
    box(28, 3, 1.4, 0, -14, 13, 'marble')
    cyl(9, 7, 0, 0, 16, 'marble', 32)
    dome(9.0, 0, 0, 23, 'marble', [(1, 0), (1.0, 0.3), (0.9, 0.62), (0.68, 0.88), (0.36, 1.05), (0.12, 1.12), (0, 1.14)], False)
    cyl(0.4, 3, 0, 0, 33.2, 'gold', 8, 0.15)
    export('memorial_hall')


# ---------------------------------------------------------------- 6. white mausoleum (Taj Mahal-inspired)
def mausoleum():
    reset()
    box(56, 56, 4, m='marble')
    core = cyl(16, 24, 0, 0, 4, 'marble', 8)
    rotz(core, math.pi / 8)
    for k in range(4):
        cutter = arch_cutter(9, 17, 6, 0, -16.5, 6, pointed=True)
        rotz(cutter, k * math.pi / 2)
        core = cut(core, cutter)
    cyl(9.5, 6, 0, 0, 28, 'marble', 32)
    dome(10.0, 0, 0, 34, 'marble', ONION, True)
    for dx in (-1, 1):
        for dy in (-1, 1):
            chhatri(dx * 10.5, dy * 10.5, 28, 2.6, 'marble')
            minaret(dx * 25, dy * 25, 4, 36, 1.7, 'marble', 3, True, 'marble', 12)
    export('mausoleum')


# ---------------------------------------------------------------- 7. palace of winds facade (Hawa Mahal-inspired)
def wind_palace():
    reset()
    tiers = [(32, 7, 9), (26, 6, 4.2), (18, 5, 4.2), (10, 4, 4.2), (5, 3, 3.5)]
    z = 0
    for w, d, h in tiers:
        box(w, d, h, 0, 0, z, 'pink')
        box(w + 0.4, d + 0.4, 0.35, 0, 0, z + h, 'white')
        n = max(1, int(w / 2.3))
        for i in range(n):
            x = -w / 2 + (i + 0.5) * w / n
            bay = cyl(0.85, h * 0.78, x, -d / 2 - 0.35, z + h * 0.1, 'pink', 6)
            dome(0.7, x, -d / 2 - 0.35, z + h * 0.88, 'pink', HEMI, False)
            box(0.9, 0.1, h * 0.45, x, -d / 2 - 1.18, z + h * 0.25, 'dark')
        z += h + 0.35
    dome(1.6, 0, 0, z, 'pink', ONION, True)
    export('wind_palace')


# ---------------------------------------------------------------- 8. lake palace (Udaipur lake palace-inspired)
def lake_palace():
    reset()
    box(64, 40, 2.4, m='white')
    blocks = [(-18, 0, 20, 30, 9), (6, -4, 22, 22, 12), (24, 4, 14, 26, 8), (-2, 12, 18, 10, 15)]
    for x, y, w, d, h in blocks:
        b = box(w, d, h, x, y, 2.4, 'white')
        for i in range(int(w / 4)):
            cc = arch_cutter(2.2, 4.2, 2, x - w / 2 + 2 + i * 4, y - d / 2, 3.0, pointed=True)
            b = cut(b, cc)
        box(w + 0.6, d + 0.6, 0.5, x, y, 2.4 + h, 'marble')
        chhatri(x, y, 2.9 + h, 1.4, 'white')
    for x in (-28, 28):
        for y in (-17, 17):
            dome(1.5, x, y, 2.4, 'white', ONION, True)
    export('lake_palace')


# ---------------------------------------------------------------- 9. granite assembly hall (Vidhana Soudha-inspired)
def assembly_hall():
    reset()
    box(80, 36, 2, m='granite')
    box(72, 30, 16, z=2, m='granite')
    box(74, 32, 1.4, z=18, m='white')
    box(30, 6, 1.4, 0, -18, 2, 'granite')
    for i in range(-6, 7):
        cyl(0.7, 13, i * 2.4, -19, 3.4, 'granite', 10)
    box(32, 5, 2, 0, -19, 16.4, 'granite')
    cyl(8, 6, 0, 0, 19.4, 'granite', 32)
    dome(8.2, 0, 0, 25.4, 'granite', [(1, 0), (1.04, 0.3), (0.95, 0.65), (0.72, 0.92), (0.4, 1.12), (0.15, 1.24), (0, 1.27)], True)
    for dx in (-1, 1):
        dome(3, dx * 30, -8, 19.4, 'granite', [(1, 0), (1.04, 0.3), (0.95, 0.65), (0.72, 0.92), (0.4, 1.12), (0.15, 1.24), (0, 1.27)], True)
    export('assembly_hall')


for fn in [war_arch, harbour_arch, victory_tower, four_minaret_gate, memorial_hall, mausoleum, wind_palace, lake_palace, assembly_hall]:
    fn()
