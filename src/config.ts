const config: object = {
    url: "http://192.168.167.24:7777",
    javaPath:"http://192.168.167.24:7777/api", // api基础路径 47.107.224.133
    outerDataBaseIndex:"006", // 增删列外部数据库的索引
    lang:"zh",  // 默认语言
    geneTypeAll:"all",  // 基因和转录本切换 基因类型为all表示有基因切换 默认为gene
    geneTypeOfGene:'gene', // 基因和转录本切换 基因类型为gene的字段名称
    geneTypeOfTranscript:"transcript",   // 基因和转录本切换 基因类型为transcript的字段名称
    sysDefend:false, // 是否系统维护
    layoutContentPadding:8
};

export default config;
