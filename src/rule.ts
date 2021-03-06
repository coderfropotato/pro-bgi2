/**
     * @author yangwd
     * @Date 2019.03.08
     * @description
     * _desc 和 _term 结尾的关键字  都需要用+++ 分割换行
     * 链接默认用 @ 占位
     */

// 基因表和富集有选择基因功能的大表 需要替换url的头仅做基础格式化
export const matchList: string[] = [
	'gene_tran_list',
	'cellmarker_desc',
	'cr2cancer_desc',
	'phi_desc',
	'prg_desc',
	'genebank_desc',
	'rfam_term_id',
	'rfam_term',
	'rfam_desc',
	'pfam_term_id',
	'pfam_term',
	'pfam_desc',
	'reactome_term_id',
	'reactome_term',
	'reactome_desc',
	'cog_term_id',
	'cog_term',
	'cog_desc',
	'eggnog_term_id',
	'eggnog_term',
	'eggnog_desc',
	'tf_term_id',
	'tf_term',
	'tf_desc',
	'tf_cofactors_id',
	'tf_cofactors_term',
	'tf_cofactors_desc',
	'go_f_term_id',
	'go_f_term',
	'go_f_desc',
	'go_p_term_id',
	'go_p_term',
	'go_p_desc',
	'go_c_term_id',
	'go_c_term',
	'go_c_desc',
	'go_cfp_term_id',
	'interpro_term_id',
	'interpro_term',
	'interpro_desc',
	'kegg_disease_term_id',
	'kegg_disease_term',
	'kegg_disease_desc',
	'kegg_module_term_id',
	'kegg_module_term',
	'kegg_module_desc',
	'kegg_pathway_term',
	'kegg_pathway_desc',
	'kegg_reaction_term_id',
	'kegg_reaction_term',
	'kegg_reaction_desc',
	'gene_kegg_k_id',
	'msigdb_archived_c5_bp_term_id',
	'msigdb_archived_c5_bp_term',
	'msigdb_archived_c5_bp_desc',
	'msigdb_archived_c5_cc_term_id',
	'msigdb_archived_c5_cc_term',
	'msigdb_archived_c5_cc_desc',
	'msigdb_archived_c5_mf_term_id',
	'msigdb_archived_c5_mf_term',
	'msigdb_archived_c5_mf_desc',
	'msigdb_c1_term_id',
	'msigdb_c1_term',
	'msigdb_c1_desc',
	'msigdb_c2_cgp_term_id',
	'msigdb_c2_cgp_term',
	'msigdb_c2_cgp_desc',
	'msigdb_c2_cp_biocarta_term_id',
	'msigdb_c2_cp_biocarta_term',
	'msigdb_c2_cp_biocarta_desc',
	'msigdb_c2_cp_kegg_term_id',
	'msigdb_c2_cp_kegg_term',
	'msigdb_c2_cp_kegg_desc',
	'msigdb_c2_cp_reactome_term_id',
	'msigdb_c2_cp_reactome_term',
	'msigdb_c2_cp_reactome_desc',
	'msigdb_c2_cp_term_id',
	'msigdb_c2_cp_term',
	'msigdb_c2_cp_desc',
	'msigdb_c3_mir_term_id',
	'msigdb_c3_mir_term',
	'msigdb_c3_mir_desc',
	'msigdb_c3_tft_term_id',
	'msigdb_c3_tft_term',
	'msigdb_c3_tft_desc',
	'msigdb_c4_cgn_term_id',
	'msigdb_c4_cgn_term',
	'msigdb_c4_cgn_desc',
	'msigdb_c4_cm_term_id',
	'msigdb_c4_cm_term',
	'msigdb_c4_cm_desc',
	'msigdb_c5_bp_term_id',
	'msigdb_c5_bp_term',
	'msigdb_c5_bp_desc',
	'msigdb_c5_cc_term_id',
	'msigdb_c5_cc_term',
	'msigdb_c5_cc_desc',
	'msigdb_c5_mf_term_id',
	'msigdb_c5_mf_term',
	'msigdb_c5_mf_desc',
	'msigdb_c6_term_id',
	'msigdb_c6_term',
	'msigdb_c6_desc',
	'msigdb_c7_term_id',
	'msigdb_c7_term',
	'msigdb_c7_desc',
	'msigdb_h_term_id',
	'msigdb_h_term',
	'msigdb_h_desc',
	'url_circbase_gene_id',
	'url_uniprot_id',
	'url_noncode_id'
];

// 跳map的头
export const mapMatchItems = [
	"kegg_pathway_term_enrichment",
	"kegg_pathway_term_id"
]

// 有--- 格式的头
// [Cellular Component]---GO:0005737///cytoplasm+++GO:0000784///unclear chromosome,telomeric region+++GO:0000346///transcriot export complex+++GO:0000445///THO complex part of transcript export complex+++[Biological Process]---GO:20000002///negative regulation of DNA damage checkpoint+++GO:0046784///viral mRna export form host cell nucleus
/*
	[Cellular Component]
	<a href="GO:0005737">GO:0005737///cytoplasm</a>
*/
export const goAll = [
    'go_all',
    'go_cfp_term',
	'go_cfp_desc'
]

// 跳转基因详情页的头
export const geneInfo:string [] = [
	'gene_id',
	'rna_id'
]

// 匹配规则
export const matchRule: object = {
	gene_tran_list:{url:''},

	cellmarker_desc: { url: '' },
	cr2cancer_desc: { url: '' },
	phi_desc: { url: '' },
	prg_desc: { url: '' },
	genebank_desc: { url: '' },

	rfam_term_id: { url: '' },
	rfam_term: { url: '' },
	rfam_desc: { url: '' },

	pfam_term_id: { url: 'http://pfam.xfam.org/family/@' },
	pfam_term: { url: 'http://pfam.xfam.org/family/@' },
	pfam_desc: { url: 'http://pfam.xfam.org/family/@' },

	reactome_term_id: { url: 'https://reactome.org/content/detail/' },
	reactome_term: { url: 'https://reactome.org/content/detail/' },
	reactome_desc: { url: 'https://reactome.org/content/detail/' },

	cog_term_id: { url: 'ftp://ftp.ncbi.nih.gov/pub/COG/COG2014/static/byCOG/@' },
	cog_term: { url: 'ftp://ftp.ncbi.nih.gov/pub/COG/COG2014/static/byCOG/@' },
	cog_desc: { url: 'ftp://ftp.ncbi.nih.gov/pub/COG/COG2014/static/byCOG/@' },

	eggnog_term_id: { url: 'http://eggnogdb.embl.de/#/app/home' },
	eggnog_term: { url: 'http://eggnogdb.embl.de/#/app/home' },
	eggnog_desc: { url: 'http://eggnogdb.embl.de/#/app/home' },

	// 根据info中的species_kingdom 的值判断  animal/plant/fungi/other
	// url 动物 植物
	tf_term_id: {
		url: [
			'http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/tf_summary?family=@',
			'http://planttfdb.cbi.pku.edu.cn/family.php?fam=@'
		],
		session: 'species_kingdom'
	},
	tf_term: {
		url: [
			'http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/tf_summary?family=@',
			'http://planttfdb.cbi.pku.edu.cn/family.php?fam=@'
		],
		session: 'species_kingdom'
	},
	tf_desc: {
		url: [
			'http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/tf_summary?family=@',
			'http://planttfdb.cbi.pku.edu.cn/family.php?fam=@'
		],
		session: 'species_kingdom'
	},

	tf_cofactors_id: { url: 'http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/' },
	tf_cofactors_term: { url: 'http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/' },
	tf_cofactors_desc: { url: 'http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/' },

	go_all:{url:'http://amigo.geneontology.org/amigo/term/@'},
	go_f_term_id: { url: 'http://amigo.geneontology.org/amigo/term/@' },
	go_f_term: { url: 'http://amigo.geneontology.org/amigo/term/@' },
	go_f_desc: { url: 'http://amigo.geneontology.org/amigo/term/@' },
	go_p_term_id: { url: 'http://amigo.geneontology.org/amigo/term/@' },
	go_p_term: { url: 'http://amigo.geneontology.org/amigo/term/@' },
	go_p_desc: { url: 'http://amigo.geneontology.org/amigo/term/@' },
	go_c_term_id: { url: 'http://amigo.geneontology.org/amigo/term/@' },
	go_c_term: { url: 'http://amigo.geneontology.org/amigo/term/@' },
    go_c_desc: { url: 'http://amigo.geneontology.org/amigo/term/@' },
    go_cfp_term:{url:'http://amigo.geneontology.org/amigo/term/@'},
	go_cfp_desc:{url:'http://amigo.geneontology.org/amigo/term/@'},
    go_cfp_term_id:{url:'http://amigo.geneontology.org/amigo/term/@'},


	interpro_term_id: { url: 'https://www.ebi.ac.uk/interpro/entry/@' },
	interpro_term: { url: 'https://www.ebi.ac.uk/interpro/entry/@' },
	interpro_desc: { url: 'https://www.ebi.ac.uk/interpro/entry/@' },

	kegg_disease_term_id: { url: 'https://www.kegg.jp/dbget-bin/www_bget?ds:@' },
	kegg_disease_term: { url: 'https://www.kegg.jp/dbget-bin/www_bget?ds:@' },
	kegg_disease_desc: { url: 'https://www.kegg.jp/dbget-bin/www_bget?ds:@' },

	kegg_module_term_id: { url: 'https://www.kegg.jp/kegg-bin/show_module?@' },
	kegg_module_term: { url: 'https://www.kegg.jp/kegg-bin/show_module?@' },
	kegg_module_desc: { url: 'https://www.kegg.jp/kegg-bin/show_module?@' },

	// 跳map
	kegg_pathway_term_enrichment: { url: 'https://www.kegg.jp/dbget-bin/www_bget?map@' },
	kegg_pathway_term_id: { url: 'https://www.kegg.jp/dbget-bin/www_bget?map@'},

	kegg_pathway_term: { url: 'https://www.kegg.jp/dbget-bin/www_bget?map@' },
	kegg_pathway_desc: { url: 'https://www.kegg.jp/dbget-bin/www_bget?map@' },

	kegg_reaction_term_id: { url: 'https://www.kegg.jp/dbget-bin/www_bget?rn:@' },
	kegg_reaction_term: { url: 'https://www.kegg.jp/dbget-bin/www_bget?rn:@' },
	kegg_reaction_desc: { url: 'https://www.kegg.jp/dbget-bin/www_bget?rn:@' },

	gene_kegg_k_id:{url:'https://www.kegg.jp/dbget-bin/www_bget?ko:@'},

	msigdb_archived_c5_bp_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_archived_c5_bp_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_archived_c5_bp_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_archived_c5_cc_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_archived_c5_cc_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_archived_c5_cc_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_archived_c5_mf_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_archived_c5_mf_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_archived_c5_mf_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c1_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c1_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c1_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cgp_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cgp_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cgp_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cp_biocarta_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cp_biocarta_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cp_biocarta_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cp_kegg_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cp_kegg_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cp_kegg_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cp_reactome_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cp_reactome_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cp_reactome_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cp_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cp_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c2_cp_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c3_mir_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c3_mir_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c3_mir_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c3_tft_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c3_tft_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c3_tft_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c4_cgn_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c4_cgn_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c4_cgn_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c4_cm_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c4_cm_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c4_cm_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c5_bp_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c5_bp_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c5_bp_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c5_cc_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c5_cc_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c5_cc_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c5_mf_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c5_mf_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c5_mf_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c6_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c6_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c6_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c7_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c7_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_c7_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_h_term_id: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_h_term: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	msigdb_h_desc: { url: 'http://software.broadinstitute.org/gsea/msigdb/cards/@' },
	url_circbase_gene_id: {url: 'http://www.circbase.org/cgi-bin/singlerecord.cgi?id=@'},
	url_uniprot_id: {url: 'https://www.uniprot.org/uniprot/@'},
	url_noncode_id: {url: 'http://www.noncode.org/show_rna.php?id=@'}
};

