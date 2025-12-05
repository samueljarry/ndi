import { MapCameraController } from '@/controllers/cameras/MapCameraController'
import { InitCommand } from "@/core/commons/commands/InitCommand"
import { AssetsId } from '@/core/commons/constants/AssetsId'
import { ViewId } from "@/core/commons/constants/views/ViewId"
import { ViewLayer } from "@/core/commons/constants/views/ViewLayer"
import { ScenesManager } from "@/core/commons/managers/ScenesManager"
import { ViewsManager } from "@/core/commons/managers/ViewsManager"
import { CamerasManager } from '@/core/three/managers/CamerasManager'
import { ThreeAssetsManager } from '@/core/three/managers/ThreeAssetsManager'
import { PassId } from '@/core/three/postprocessing/constants/PassId'
import { PostProcessingProxy } from '@/core/three/postprocessing/proxies/PostProcessingProxy'
import { MainPostProcessingPass } from '@/postprocessing/MainPostProcessingPass'
import { DemoScene } from '@/scenes/DefaultScene'
import { DemoThreeView } from '@/views/three/DefaultThreeView'
import { MapThreeView } from '@/views/three/MapThreeView/MapThreeView'
import DemoVueView from "@/views/vue/DemoVueView.vue"
import DialogModalVueView from '@/views/vue/DialogModalVueView.vue'
import ForgeronGameVueView from '@/views/vue/ForgeronGameVueView.vue'
import HouseDialogVueView from '@/views/vue/HouseDialogVueView.vue'
import HouseDisplayVueView from '@/views/vue/HouseDisplayVueView.vue'
import JardinierGameVueView from '@/views/vue/JardinierGameVueView.vue'
import MecanoGameVueView from '@/views/vue/MecanoGameVueView.vue'
import ScientifiqueGameVueView from '@/views/vue/ScientifiqueGameVueView.vue'
import SnakeVueView from '@/views/vue/SnakeVueView.vue'
import StrategeGameVueView from '@/views/vue/StrategeGameVueView.vue'
import { AnalyseGLTFCommand } from '../AnalyseGLTFCommand'

export class GlobalInitCommand extends InitCommand {
  public override async initBefore() {

  }

  public override async initProxies() {
    
  }

  public override async initManagers() {
    
  }

  public override async initThree() {
    ThreeAssetsManager.AddGlb(AssetsId.GLB_MAP, 'models/map3.glb');
    CamerasManager.Add(MapCameraController);

    PostProcessingProxy.AddPass(PassId.MAIN, new MainPostProcessingPass());
  }

  public override async initCommons() {
    
  }

  public override async initAfterLoad() {

  }

  public override initViews() {  
    ViewsManager.CreateThreeView(DemoThreeView);
    ViewsManager.CreateVueView(ViewId.DEMO, DemoVueView, ViewLayer.UI_1);
    ViewsManager.CreateVueView(ViewId.DIALOG_MODAL, DialogModalVueView, ViewLayer.UI_1);
    ViewsManager.CreateThreeView(MapThreeView);
    ViewsManager.CreateVueView(ViewId.HOUSE_DISPLAY, HouseDisplayVueView, ViewLayer.UI_2);
    ViewsManager.CreateVueView(ViewId.HOUSE_DIALOG, HouseDialogVueView, ViewLayer.UI_3);
    ViewsManager.CreateVueView(ViewId.FORGERON_GAME, ForgeronGameVueView, ViewLayer.GAME);
    ViewsManager.CreateVueView(ViewId.SCIENTIFIQUE_GAME, ScientifiqueGameVueView, ViewLayer.GAME);
    ViewsManager.CreateVueView(ViewId.STRATEGE_GAME, StrategeGameVueView, ViewLayer.GAME);
    ViewsManager.CreateVueView(ViewId.JARDINIER_GAME, JardinierGameVueView, ViewLayer.GAME);
    ViewsManager.CreateVueView(ViewId.MECANO_GAME, MecanoGameVueView, ViewLayer.GAME);
    ViewsManager.CreateVueView(ViewId.SNAKE, SnakeVueView, ViewLayer.GAME);
  }
  
  public override initScenes() {
    ScenesManager.Add(DemoScene);
  }

  public override async initAfter() {
    AnalyseGLTFCommand.Analyse(AssetsId.GLB_MAP);
  }
}