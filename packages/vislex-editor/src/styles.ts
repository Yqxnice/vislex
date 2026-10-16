// 纯样式入口：构建期触发本包全部 .css.ts 的 VE 提取，并向宿主聚合 style-token。
// 新增插件的 css.ts 需在此追加一行 side-effect import。
import '@vislex/style-token/styles';
import './ui/classes.css';
import './ui/editor.css';
import './ui/toolbar.css';
import './composer/theme.css';
import './plugins/banner/banner.css';
import './plugins/codeBlock/codeBlock.css';
import './plugins/codeBlock/codeMirrorModal.css';
import './plugins/draggableBlock/draggableBlock.css';
import './plugins/embed/embed.css';
import './plugins/gallery/GalleryComponent.css';
import './plugins/gallery/GalleryLightbox.css';
import './plugins/gallery/GalleryModal.css';
import './plugins/linkCard/linkCard.css';
import './plugins/math/math.css';
import './plugins/mention/mention.css';
import './plugins/mermaid/mermaid.css';
import './plugins/ruby/ruby.css';
import './plugins/slash/slashMenu.css';
import './plugins/table/tableTheme.css';
import './plugins/table/tableToolbar.css';
import './plugins/video/video.css';
import './plugins/whiteboard/whiteboard.css';
