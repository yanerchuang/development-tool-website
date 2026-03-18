import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Encoding from './pages/Encoding';
import Time from './pages/Time';
import Color from './pages/Color';
import Crypto from './pages/Crypto';
import Base64 from './pages/Base64';
import Json from './pages/Json';
import Text from './pages/Text';
import Image from './pages/Image';
import Network from './pages/Network';
import Dev from './pages/Dev';
import Uuid from './pages/Uuid';
import Regex from './pages/Regex';
import Diff from './pages/Diff';
import QRCode from './pages/QRCode';
import Hash from './pages/Hash';
import Password from './pages/Password';
import NumberBase from './pages/NumberBase';
import Lorem from './pages/Lorem';
import Cron from './pages/Cron';
import UnitConverter from './pages/UnitConverter';
import Calculator from './pages/Calculator';
import CodeFormatter from './pages/CodeFormatter';
import JWTDecoder from './pages/JWTDecoder';
import GradientGenerator from './pages/GradientGenerator';
import MarkdownPreview from './pages/MarkdownPreview';
import IPCalculator from './pages/IPCalculator';
import ShadowGenerator from './pages/ShadowGenerator';
import RandomData from './pages/RandomData';
import CodeImage from './pages/CodeImage';
import ImageBase64 from './pages/ImageBase64';
import HealthCalculator from './pages/HealthCalculator';
import ImageCompress from './pages/ImageCompress';
import GifGenerator from './pages/GifGenerator';
import SqlFormatter from './pages/SqlFormatter';
import Playground from './pages/Playground';
import AdvancedHealth from './pages/AdvancedHealth';
import PregnancyCalculator from './pages/PregnancyCalculator';
import ChildGrowth from './pages/ChildGrowth';
import ApiTester from './pages/ApiTester';
import WebSocketTester from './pages/WebSocketTester';
import RegexVisualizer from './pages/RegexVisualizer';
import PasswordStrength from './pages/PasswordStrength';
import FileHash from './pages/FileHash';
import Stopwatch from './pages/Stopwatch';
import Pomodoro from './pages/Pomodoro';
import TodoList from './pages/TodoList';
import CountdownTimer from './pages/CountdownTimer';
import KeyEventTester from './pages/KeyEventTester';
import MorseCode from './pages/MorseCode';
import QuickNotes from './pages/QuickNotes';
import JsonYaml from './pages/JsonYaml';
import ColorContrast from './pages/ColorContrast';
import WorldClock from './pages/WorldClock';
import ClipPathGenerator from './pages/ClipPathGenerator';
import EmojiPicker from './pages/EmojiPicker';
import JsBenchmark from './pages/JsBenchmark';
import PaletteGenerator from './pages/PaletteGenerator';
import LoremPicsum from './pages/LoremPicsum';
import CreditCardGenerator from './pages/CreditCardGenerator';
import FakeDataGenerator from './pages/FakeDataGenerator';
import MultiClipboard from './pages/MultiClipboard';
import CodeSnippets from './pages/CodeSnippets';
import RSATool from './pages/RSATool';
import SortingVisualizer from './pages/SortingVisualizer';
import PercentageCalculator from './pages/PercentageCalculator';
import LoanCalculator from './pages/LoanCalculator';
import AsciiArtGenerator from './pages/AsciiArtGenerator';
import TextStatistics from './pages/TextStatistics';
import CssGridGenerator from './pages/CssGridGenerator';
import FlexboxGenerator from './pages/FlexboxGenerator';
import CaseConverter from './pages/CaseConverter';
import NumberFormatter from './pages/NumberFormatter';
import UrlParser from './pages/UrlParser';
import HtmlEntityEncoder from './pages/HtmlEntityEncoder';
import TransformGenerator from './pages/TransformGenerator';
import ExcelViewer from './pages/ExcelViewer';
import WordViewer from './pages/WordViewer';
import XmlFormatter from './pages/XmlFormatter';
import JsonSchemaValidator from './pages/JsonSchemaValidator';
import CsvViewer from './pages/CsvViewer';
import CodeDiff from './pages/CodeDiff';
import JsonPath from './pages/JsonPath';
import GitignoreGenerator from './pages/GitignoreGenerator';
import DockerfileGenerator from './pages/DockerfileGenerator';
import SvgOptimizer from './pages/SvgOptimizer';
import SqlBuilder from './pages/SqlBuilder';
import CodeMinifier from './pages/CodeMinifier';
import I18nTool from './pages/I18nTool';
import EnvManager from './pages/EnvManager';
import RegexBuilder from './pages/RegexBuilder';
import GitCheatsheet from './pages/GitCheatsheet';
import TimestampBatch from './pages/TimestampBatch';
import LogAnalyzer from './pages/LogAnalyzer';
import TypeScriptGenerator from './pages/TypeScriptGenerator';

const basename = import.meta.env.BASE_URL;

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <Home /> },
        { path: 'encoding', element: <Encoding /> },
        { path: 'time', element: <Time /> },
        { path: 'color', element: <Color /> },
        { path: 'crypto', element: <Crypto /> },
        { path: 'base64', element: <Base64 /> },
        { path: 'json', element: <Json /> },
        { path: 'text', element: <Text /> },
        { path: 'image', element: <Image /> },
        { path: 'network', element: <Network /> },
        { path: 'dev', element: <Dev /> },
        { path: 'uuid', element: <Uuid /> },
        { path: 'regex', element: <Regex /> },
        { path: 'diff', element: <Diff /> },
        { path: 'qrcode', element: <QRCode /> },
        { path: 'hash', element: <Hash /> },
        { path: 'password', element: <Password /> },
        { path: 'numberbase', element: <NumberBase /> },
        { path: 'lorem', element: <Lorem /> },
        { path: 'cron', element: <Cron /> },
        { path: 'unit', element: <UnitConverter /> },
        { path: 'calculator', element: <Calculator /> },
        { path: 'code-formatter', element: <CodeFormatter /> },
        { path: 'jwt', element: <JWTDecoder /> },
        { path: 'gradient', element: <GradientGenerator /> },
        { path: 'markdown', element: <MarkdownPreview /> },
        { path: 'ip-calc', element: <IPCalculator /> },
        { path: 'shadow', element: <ShadowGenerator /> },
        { path: 'random', element: <RandomData /> },
        { path: 'code-image', element: <CodeImage /> },
        { path: 'image-base64', element: <ImageBase64 /> },
        { path: 'health', element: <HealthCalculator /> },
        { path: 'image-compress', element: <ImageCompress /> },
        { path: 'gif-generator', element: <GifGenerator /> },
        { path: 'sql-formatter', element: <SqlFormatter /> },
        { path: 'playground', element: <Playground /> },
        { path: 'advanced-health', element: <AdvancedHealth /> },
        { path: 'pregnancy', element: <PregnancyCalculator /> },
        { path: 'child-growth', element: <ChildGrowth /> },
        { path: 'api-tester', element: <ApiTester /> },
        { path: 'websocket', element: <WebSocketTester /> },
        { path: 'regex-visualizer', element: <RegexVisualizer /> },
        { path: 'password-strength', element: <PasswordStrength /> },
        { path: 'file-hash', element: <FileHash /> },
        { path: 'stopwatch', element: <Stopwatch /> },
        { path: 'pomodoro', element: <Pomodoro /> },
        { path: 'todo', element: <TodoList /> },
        { path: 'countdown', element: <CountdownTimer /> },
        { path: 'key-test', element: <KeyEventTester /> },
        { path: 'morse', element: <MorseCode /> },
        { path: 'notes', element: <QuickNotes /> },
        { path: 'json-yaml', element: <JsonYaml /> },
        { path: 'contrast', element: <ColorContrast /> },
        { path: 'world-clock', element: <WorldClock /> },
        { path: 'clip-path', element: <ClipPathGenerator /> },
        { path: 'emoji', element: <EmojiPicker /> },
        { path: 'benchmark', element: <JsBenchmark /> },
        { path: 'palette', element: <PaletteGenerator /> },
        { path: 'picsum', element: <LoremPicsum /> },
        { path: 'credit-card', element: <CreditCardGenerator /> },
        { path: 'fake-data', element: <FakeDataGenerator /> },
        { path: 'multi-clip', element: <MultiClipboard /> },
        { path: 'snippets', element: <CodeSnippets /> },
        { path: 'rsa', element: <RSATool /> },
        { path: 'sorting', element: <SortingVisualizer /> },
        { path: 'percentage', element: <PercentageCalculator /> },
        { path: 'loan', element: <LoanCalculator /> },
        { path: 'ascii-art', element: <AsciiArtGenerator /> },
        { path: 'text-stats', element: <TextStatistics /> },
        { path: 'css-grid', element: <CssGridGenerator /> },
        { path: 'flexbox', element: <FlexboxGenerator /> },
        { path: 'case', element: <CaseConverter /> },
        { path: 'number-format', element: <NumberFormatter /> },
        { path: 'url-parser', element: <UrlParser /> },
        { path: 'html-entity', element: <HtmlEntityEncoder /> },
        { path: 'transform', element: <TransformGenerator /> },
        { path: 'excel', element: <ExcelViewer /> },
        { path: 'word', element: <WordViewer /> },
        { path: 'xml', element: <XmlFormatter /> },
        { path: 'json-schema', element: <JsonSchemaValidator /> },
        { path: 'csv', element: <CsvViewer /> },
        { path: 'code-diff', element: <CodeDiff /> },
        { path: 'json-path', element: <JsonPath /> },
        { path: 'gitignore', element: <GitignoreGenerator /> },
        { path: 'dockerfile', element: <DockerfileGenerator /> },
        { path: 'svg-optimizer', element: <SvgOptimizer /> },
        { path: 'sql-builder', element: <SqlBuilder /> },
        { path: 'code-minify', element: <CodeMinifier /> },
        { path: 'i18n', element: <I18nTool /> },
        { path: 'env-manager', element: <EnvManager /> },
        { path: 'regex-builder', element: <RegexBuilder /> },
        { path: 'git-cheatsheet', element: <GitCheatsheet /> },
        { path: 'timestamp-batch', element: <TimestampBatch /> },
        { path: 'log-analyzer', element: <LogAnalyzer /> },
        { path: 'ts-generator', element: <TypeScriptGenerator /> },
      ],
    },
  ],
  { basename }
);