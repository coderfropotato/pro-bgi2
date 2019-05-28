import { matchList, matchRule,geneInfo,mapMatchItems,goAll } from './rule';

const config: object = {
    url: 'http://localhost:8086', // 本地服务测试
    // 线上 218.106.117.7
    // 测试 192.168.167.24:7777
	javaPath: 'http://biosys.bgi.com/api', // api基础路径
	outerDataBaseIndex: '006', // 增删列外部数据库的索引
	lang: 'zh', // 默认语言
	geneTypeAll: 'all', // 基因和转录本切换 基因类型为all表示有基因切换 默认为gene
	geneTypeOfGene: 'gene', // 基因和转录本切换 基因类型为gene的字段名称
	geneTypeOfTranscript: 'rna', // 基因和转录本切换 基因类型为transcript的字段名称
	getAnalysisListCountInterval: 20000, // 获取重分析任务列表的时间间隔
	getAnalysisCountInterval: 20000, // 获取未查看重分析任务条数的时间间隔
	sysDefend: false, // 是否系统维护
    layoutContentPadding: 8,
    rna:'RNA ID',   // 外部触发表格筛选的时候 筛选条件按照filterNamezh编译 需要和rna_id列的 name 保持一致
    gene:'Gene ID',  // 外部触发表格筛选的时候 筛选条件按照filterNamezh编译 需要和gene_id列的 name 保持一致
    as_id: 'ID',
    maxTextLength:60, // 图标题的字符长度限制
	matchList,
	matchRule,
	geneInfo,
	mapMatchItems,
    goAll,
    relationHeatmapLimit:20000,  // 关联聚类工具的乘积最大值
	TCGA_KEY:"006001", // TACG 外部数据库 树增加头需要请求（app-new-tree） 别的外部数据库不需要分步请求(app-tree)
	targetRelativeGeneLimit:1000,  // 上下游关系选择的基因限制 最大1000
	unableClickSplitFlag:'---', // 不可点击的换行分割符
	urlSplitFlag: '@', // 切割url的标志字符
	valSplitFlag: '+++', // 内容换行的标志字符
	idComposeDesc: '///', // id和描述的组合标志字符
	pathwayURL:'production'//'test' production
};

export default config;
