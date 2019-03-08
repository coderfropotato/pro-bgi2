|	term编号（用于富集的第一张表）	|	内容示例1	|	term的编号及描述1（用于分类和富集的基因表）	|	term的编号及描述2（用于扩展列）	|	term的编号及描述内容示例（描述1、描述2的格式相同）	|	url	|	备注	|		
|	           ---------	|	           ---------	|	           ---------	|	           ---------	|	           ---------	|	           ---------	|	           ---------	|	           ---------	|
|	name +    _term_id	|	go:123456	|	name +    _term	|	name +   _desc	|	go:123///go123的描述+++go:234///go234的描述+++go:345///go345的描述	|		|		|		
|		|		|		|	cellmarker_desc	|		|		|		|		
|		|		|		|	cr2cancer_desc	|		|		|		|		
|		|		|		|	phi_desc	|		|		|		|		
|		|		|		|	prg_desc	|		|		|		|		
|		|		|		|	genebank_desc	|		|		|		|		
|	rfam_term_id	|		|	rfam_term	|	rfam_desc	|		|		|		|		
|	pfam_term_id	|	pf00797	|	pfam_term	|	pfam_desc	|		|	http://pfam.xfam.org/family/[替换内容]	|		|		
|	reactome_term_id	|		|	reactome_term	|	reactome_desc	|		|	https://reactome.org/	|	待定	|	待确定	
|	cog_term_id	|	cog1816	|	cog_term	|	cog_desc	|		|	ftp://ftp.ncbi.nih.gov/pub/COG/COG2014/static/byCOG/[替换内容]	|		|		
|	eggnog_term_id	|		|	eggnog_term	|	eggnog_desc	|		|	http://eggnogdb.embl.de/#/app/home	|		|		
|	tf_term_id	|		|	tf_term	|	tf_desc	|		|	动物：http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/tf_summary?family=[替换内容] 植物：http://planttfdb.cbi.pku.edu.cn/family.php?fam=[替换内容]	|	根据info中的species_kingdom 的值判断  animal/plant/fungi/other	|	待数据	
|	tf_cofactors_id	|		|	tf_cofactors_term	|	tf_cofactors_desc	|		|	http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/	|		|		
|	go_f_term_id	|		|	go_f_term	|	go_f_desc	|		|	http://amigo.geneontology.org/amigo/term/[替换内容]	|		|		
|	go_p_term_id	|		|	go_p_term	|	go_p_desc	|		|		|		|		
|	go_c_term_id	|		|	go_c_term	|	go_c_desc	|		|		|		|		
|	interpro_term_id	|	ipr003598	|	interpro_term	|	interpro_desc	|		|	https://www.ebi.ac.uk/interpro/entry/[替换内容]	|		|		
|	kegg_disease_term_id	|	H00420	|	kegg_disease_term	|	kegg_disease_desc	|		|	https://www.kegg.jp/dbget-bin/www_bget?ds:[替换内容]	|		|		|
|	kegg_module_term_id	|	M00296	|	kegg_module_term	|	kegg_module_desc	|		|	https://www.kegg.jp/kegg-bin/show_module?[替换内容] 	|		|		|
|	kegg_pathway_term_id（富集）	|	5204	|	kegg_pathway_term	|	kegg_pathway_desc	|		|	https://www.kegg.jp/dbget-bin/www_bget?map[替换内容]	|	富集模块里面kegg_pathway_term_id、kegg_pathway_term需要跳到另外的页面，根据任务ID或比较组	|	需要区分富集，另需传参 id，compareGroup	|
|	kegg_reaction_term_id	|		|	kegg_reaction_term	|	kegg_reaction_desc	|		|	https://www.kegg.jp/dbget-bin/www_bget?rn:[替换内容]	|		|		|
|	msigdb_archived_c5_bp_term_id	|	hallmark_coagulation	|	msigdb_archived_c5_bp_term	|	msigdb_archived_c5_bp_desc	|		|	http://software.broadinstitute.org/gsea/msigdb/cards/[替换内容]	|		|		|
|	msigdb_archived_c5_cc_term_id	|		|	msigdb_archived_c5_cc_term	|	msigdb_archived_c5_cc_desc	|		|		|		|		|
|	msigdb_archived_c5_mf_term_id	|		|	msigdb_archived_c5_mf_term	|	msigdb_archived_c5_mf_desc	|		|		|		|		|
|	msigdb_c1_term_id	|		|	msigdb_c1_term	|	msigdb_c1_desc	|		|		|		|		|
|	msigdb_c2_cgp_term_id	|		|	msigdb_c2_cgp_term	|	msigdb_c2_cgp_desc	|		|		|		|		|
|	msigdb_c2_cp_biocarta_term_id	|		|	msigdb_c2_cp_biocarta_term	|	msigdb_c2_cp_biocarta_desc	|		|		|		|		|
|	msigdb_c2_cp_kegg_term_id	|		|	msigdb_c2_cp_kegg_term	|	msigdb_c2_cp_kegg_desc	|		|		|		|		|
|	msigdb_c2_cp_reactome_term_id	|		|	msigdb_c2_cp_reactome_term	|	msigdb_c2_cp_reactome_desc	|		|		|		|		|
|	msigdb_c2_cp_term_id	|		|	msigdb_c2_cp_term	|	msigdb_c2_cp_desc	|		|		|		|		|
|	msigdb_c3_mir_term_id	|		|	msigdb_c3_mir_term	|	msigdb_c3_mir_desc	|		|		|		|		|
|	msigdb_c3_tft_term_id	|		|	msigdb_c3_tft_term	|	msigdb_c3_tft_desc	|		|		|		|		|
|	msigdb_c4_cgn_term_id	|		|	msigdb_c4_cgn_term	|	msigdb_c4_cgn_desc	|		|		|		|		|
|	msigdb_c4_cm_term_id	|		|	msigdb_c4_cm_term	|	msigdb_c4_cm_desc	|		|		|		|		|
|	msigdb_c5_bp_term_id	|		|	msigdb_c5_bp_term	|	msigdb_c5_bp_desc	|		|		|		|		|
|	msigdb_c5_cc_term_id	|		|	msigdb_c5_cc_term	|	msigdb_c5_cc_desc	|		|		|		|		|
|	msigdb_c5_mf_term_id	|		|	msigdb_c5_mf_term	|	msigdb_c5_mf_desc	|		|		|		|		|
|	msigdb_c6_term_id	|		|	msigdb_c6_term	|	msigdb_c6_desc	|		|		|		|		|
|	msigdb_c7_term_id	|		|	msigdb_c7_term	|	msigdb_c7_desc	|		|		|		|		|
|	msigdb_h_term_id	|		|	msigdb_h_term	|	msigdb_h_desc	|		|		|		|		|
